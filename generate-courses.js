// import _ from 'lodash';
// import mongoose from 'mongoose';
// import dummyjson from 'dummy-json';
// import async from 'async';

// import { CourseModel } from './api/course';

// const mongoConfig = {
//   autoReconnect: true,
//   reconnectTries: Number.MAX_VALUE,
//   reconnectInterval: 500,
// };

// mongoose.connect('mongodb://localhost/e2e', mongoConfig);

// const courseTemplateString = `
//   {
//     "courses": [
//       {{#repeat 20}}
//       {
//         "title": "{{firstName}}",
//         "description": "{{lorem}}"
//       }
//       {{/repeat}}
//     ]
//   }
// `;

// const nodeTemplateString = `
//   {
//     "nodes": [
//       {{#repeat 10}}
//       {
//         "title": "{{firstName}}",
//         "nodeType": "blob",
//         "blobType": "VIDEO",
//         "url": "{{email}}"
//       }
//       {{/repeat}}
//     ]
//   }
// `;

// const generateCourses = () => new Promise((resolve, reject) => {
//   const courseString = dummyjson.parse(courseTemplateString);
//   const nodeString = dummyjson.parse(nodeTemplateString);
//   const { courses } = JSON.parse(courseString);
//   const { nodes } = JSON.parse(nodeString);

//   const createCourse = function createCourse(cb) {
//     CourseModel.createCourse(this.title, this.description)
//       .then(createdCourse => cb(null, createdCourse));
//   };

//   const createNode = function createNode(course, cb) {
//     const path = [_.last(course.branches.master.commits).checksum];
//     CourseModel.addNode(course.courseId, 'master', this, path)
//       .then((createdCourse) => {
//         cb(null, createdCourse);
//       });
//   };

//   const coursesWithNodes = _.map(courses, (course) => {
//     const courseToBeCreated = createCourse.bind(course);
//     const nodesToBeCreated = nodes.map(node => createNode.bind(node));
//     const waterfallSet = [courseToBeCreated, ...nodesToBeCreated];
//     return async.waterfall.bind(async, waterfallSet);
//   });

//   async.parallel(coursesWithNodes, (err, createdCourses) => {
//     resolve(createdCourses);
//   });
// });

// generateCourses().then(async () => {
//   await mongoose.connection.close();
// });
