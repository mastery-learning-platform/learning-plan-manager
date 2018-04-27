import _ from 'lodash';
import { NodeModel } from './node.model';

const createCourse = async (obj, args, context) => {
  const { title, description } = args.input;
  const createdCourse = await context.mongo.models.course.createCourse(title, description);
  return createdCourse;
};

const courses = async (obj, args, context) => {
  const foundCourses = await context.mongo.models.course.find({});
  return foundCourses;
};

const course = async (obj, args, context) => {
  const { courseId } = args;
  const foundCourse = await context.mongo.models.course.findOne({ _id: courseId });
  return foundCourse;
};

// const node = async (obj, args, context) => {
//   const { courseId, nodeId } = args;
//   const foundNode = await context.mongo.models.course.findNode(courseId, nodeId);
//   return foundNode;
// };

const nodes = async (obj, args, context) => {
  const { courseId, checksums } = args;
  const foundNodes = await context.mongo.models.course.fetchNodes(courseId, checksums);
  return foundNodes;
};

const createBranch = async (obj, args, context) => {
  const { courseId, branchName, parent } = args.input;
  const courseWithCreatedBranch = await context.mongo.models
    .course.addBranch(courseId, branchName, parent);
  const branchesObj = courseWithCreatedBranch.branches;
  const branch = {
    title: branchName,
    root: courseWithCreatedBranch.nodes[_.last(branchesObj[branchName].commits).checksum],
  };
  return branch;
};

const createNode = async (obj, args, context) => {
  const { courseId, branchName, node: nodeToBeCreated } = args;
  const courseWithCreatedNode = await context.mongo.models
    .course.addNode(courseId, branchName, nodeToBeCreated);
  const nodeModel = new NodeModel(nodeToBeCreated);
  const nodeObj = _.assign(courseWithCreatedNode.nodes[nodeModel.checksum], courseId);
  return nodeObj;
};

const CourseResolver = {
  Query: {
    course,
    nodes,
    courses,
  },
  Mutation: {
    createCourse,
    createBranch,
    createNode,
  },
};

export default CourseResolver;
export { CourseResolver };
