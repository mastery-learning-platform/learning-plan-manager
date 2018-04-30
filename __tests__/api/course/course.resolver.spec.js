import _ from 'lodash';
import sinon from 'sinon';
import should from 'should';
import mongoose from 'mongoose';
import dummyjson from 'dummy-json';

import { CourseResolver, CourseModel, NodeModel } from '../../../api/course';

let context;

const defaultCourseId = mongoose.Types.ObjectId();
const cachedNodes = (() => {
  const nodesTemplate = `
    {
      "nodes": [
        {{#repeat 10}}
        {
          "title": "{{firstName}}",
          "nodeType": "blob",
          "blobType": "VIDEO",
          "url": "{{email}}"
        }
        {{/repeat}}
      ]
    }
  `;
  const genNodeDataString = dummyjson.parse(nodesTemplate);
  const genNodeDataJSON = JSON.parse(genNodeDataString);
  const nodes = genNodeDataJSON.nodes.map(node => new NodeModel(node));
  return nodes;
})();

describe('Course Resolver', () => {
  beforeAll(() => {
    context = {
      mongo: {
        models: {
          course: {
            createCourse: sinon.stub().callsFake((title, description) => {
              const createdCourse = new CourseModel({
                title,
                description,
                _id: defaultCourseId,
                branches: {},
                nodes: {},
              });
              return new Promise(resolve => resolve(createdCourse));
            }),
            createNode: sinon.stub().callsFake((courseId, branchName, nodeToBeCreated) => {
              const nodeModel = new NodeModel(nodeToBeCreated);
              const nodeModelAsJson = nodeModel.toJSON();
              const node = _.assign(nodeModelAsJson, { courseId });
              return new Promise(resolve => resolve(node));
            }),
            createBranch: sinon.stub().callsFake((courseId, branchName) => {
              const rootNode = new NodeModel({
                nodeType: 'tree',
                title: 'Fundamentals of Computing',
              });
              const createdBranch = {
                title: branchName,
                root: rootNode,
                courseId,
              };
              return new Promise(resolve => resolve(createdBranch));
            }),
            find: sinon.stub().callsFake(() => {
              const coursesToBeCreated = [
                {
                  title: 'Fundamentals of Computing',
                  description: 'Describes Fundamentals of Computing',
                },
                {
                  title: 'Fundamentals of NodeJS',
                  description: 'Describes Fundamentals of NodeJS',
                },
              ];
              const createdCourses = coursesToBeCreated.map(course => new CourseModel(course));
              return new Promise(resolve => resolve(createdCourses));
            }),
            fetchNodes: sinon.stub().callsFake(() => cachedNodes),
          },
        },
      },
    };
  });

  test('Should be able to createNode', async () => {
    const node = new NodeModel({
      title: 'Promises in JS',
      nodeType: 'blob',
      blobType: 'video',
      url: 'http:/youtube.com',
      path: [defaultCourseId],
    });
    const branchName = 'master';
    const args = {
      courseId: defaultCourseId,
      node,
      branchName,
    };
    const createdNode = await CourseResolver.Mutation.createNode({}, args, context);
    context.mongo.models.course.createNode.calledOnce.should.be.exactly(true);
    should.exist(createdNode);
    createdNode.should.have.properties(['title', 'nodeType', 'blobType', 'url', 'checksum', 'courseId']);
    createdNode.title.should.be.exactly(node.title);
    createdNode.nodeType.should.be.exactly(node.nodeType);
    createdNode.blobType.should.be.exactly(node.blobType);
    createdNode.courseId.should.be.exactly(defaultCourseId);
    createdNode.url.should.be.exactly(node.url);
  });

  test('Should be able to createBranch', async () => {
    const args = {
      input: {
        courseId: defaultCourseId,
        branchName: 'NodeJS - Basics',
        parentBranchName: 'master',
      },
    };
    const createdBranch = await CourseResolver.Mutation.createBranch({}, args, context);
    context.mongo.models.course.createBranch.calledOnce.should.be.exactly(true);
    should.exist(createdBranch);
    createdBranch.should.have.properties(['title', 'root', 'courseId']);
    createdBranch.title.should.be.exactly(args.input.branchName);
    createdBranch.root.nodeType.should.be.exactly('tree');
    createdBranch.courseId.should.be.exactly(defaultCourseId);
  });

  test('Should be able to createCourse', async () => {
    const args = {
      input: {
        title: 'Fundamentals of Computing',
        description: 'This course deals with fundamentals of computing',
      },
    };
    const createdCourse = await CourseResolver.Mutation.createCourse({}, args, context);
    context.mongo.models.course.createCourse.calledOnce.should.be.exactly(true);
    should.exist(createdCourse);
    createdCourse.should.have.properties(['title', 'description', 'courseId', 'branches', 'nodes']);
    createdCourse.title.should.be.exactly(args.input.title);
    createdCourse.description.should.be.exactly(args.input.description);
  });

  test('Should be able to find all courses', async () => {
    const foundCourses = await CourseResolver.Query.courses({}, {}, context);
    context.mongo.models.course.find.calledOnce.should.be.exactly(true);
    foundCourses.should.be.an.instanceOf(Array);
    foundCourses[0].should.have.properties(['title', 'description', 'courseId', 'branches', 'nodes']);
  });

  test('Should be able to find all nodes', async () => {
    const preCachedChecksums = _.map(cachedNodes, node => node.checksum);
    const args = {
      courseId: defaultCourseId,
      checksums: preCachedChecksums,
    };
    const foundNodes = await CourseResolver.Query.nodes({}, args, context);
    should.exist(foundNodes);
    foundNodes.should.be.an.instanceOf(Array);
    const sampleNode = _.head(foundNodes);
    sampleNode.should.have.properties(['title', 'checksum', 'nodeType', 'blobType', 'url']);
  });
});
