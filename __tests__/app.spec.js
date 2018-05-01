import _ from 'lodash';
import express from 'express';
import graphqlHTTP from 'express-graphql';
import request from 'supertest';
import should from 'should';
import mongoose from 'mongoose';
import bodyParser from 'body-parser';

import { config } from '../config';
import { schema } from '../api';

jest.setTimeout(10000);

const app = express();
let courseID;

describe('Learning Plan Manager', () => {
  beforeAll(async () => {
    const mongoConfig = {
      autoReconnect: true,
      reconnectTries: Number.MAX_VALUE,
      reconnectInterval: 500,
    };

    mongoose.connect('mongodb://localhost/e2e', mongoConfig);

    app.use(bodyParser.json());
    app.use(bodyParser.urlencoded({ extended: true }));
    app.use('/graphql', graphqlHTTP(req => ({
      schema,
      context: {
        request: req,
        mongo: mongoose,
      },
    })));
    await app.listen(config.PORT);
  });

  it('Should be able to createCourse', (done) => {
    const query = `mutation CreateCourse($input: CourseInput){
      createCourse(input: $input) {
        title
        description
        courseId
      }
    }`;
    const variables = {
      input: {
        title: 'Fundamentals of Computing',
        description: 'This Course teaches Fundamentals of Computing',
      },
    };

    request(app)
      .post('/graphql')
      .type('form')
      .send({ query, variables })
      .expect(200)
      .end((err, res) => {
        should.not.exist(err);
        should.exist(res.body);
        res.body.should.have.propertyByPath('data', 'createCourse', 'title');
        res.body.should.have.propertyByPath('data', 'createCourse', 'description');
        res.body.should.have.propertyByPath('data', 'createCourse', 'courseId');
        courseID = res.body.data.createCourse.courseId;
        done();
      });
  });

  it('Should be able to fetch created courses', (done) => {
    const query = `query {
      courses {
        title
        courseId
        description
        branches {
          title
          root {
            title
          }
        }
        nodes {
          title
        }
      }
    }`;

    request(app)
      .post('/graphql')
      .type('form')
      .send({ query })
      .expect(200)
      .end((err, res) => {
        should.not.exist(err);
        should.exist(res.body);
        res.body.data.courses.should.be.an.instanceOf(Array);
        const courseSample = res.body.data.courses[0];
        courseSample.should.have.property('title');
        courseSample.should.have.property('courseId');
        courseSample.should.have.property('description');
        courseSample.should.have.property('branches');
        courseSample.should.have.property('nodes');
        const nodeSample = _.head(courseSample.nodes);
        nodeSample.should.have.property('title');
        courseSample.nodes.should.be.an.instanceOf(Array);
        done();
      });
  });

  it('Should be able to fetch nodes', (done) => {
    const query = `query {
      nodes(courseId: "${courseID}") {
        title
        nodeType
        blobType
        url
      }
    }`;

    request(app)
      .post('/graphql')
      .type('form')
      .send({ query })
      .expect(200)
      .end((err, res) => {
        should.not.exist(err);
        should.exist(res.body);
        res.body.data.nodes.should.be.an.instanceOf(Array);
        const nodeSample = res.body.data.nodes[0];
        nodeSample.should.have.properties(['title', 'nodeType', 'url', 'blobType']);
        done();
      });
  });

  afterAll(async () => {
    await mongoose.connection.db.dropDatabase('e2e');
    await mongoose.connection.close();
  });
});
