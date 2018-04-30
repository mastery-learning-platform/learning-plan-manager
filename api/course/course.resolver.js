import _ from 'lodash';

const createCourse = async (obj, args, context) => {
  const { title, description } = args.input;
  const createdCourse = await context.mongo.models.course.createCourse(title, description);
  return createdCourse;
};

/**
 *
 * @param {*} obj
 * @param {*} args
 * @param {*} context
 * @todo Have to put the transformation logic in the course model
 */
const courses = async (obj, args, context) => {
  const foundCourses = await context.mongo.models.course.find({});
  const transformedCourses = _.map(foundCourses, (course) => {
    const { branches, nodes } = course;
    const transformedBranches = _.map(branches, (value, key) => {
      return {
        title: key,
        root: course.toJSON().nodes[_.last(value.commits).checksum],
      };
    });
    const transformedNodes = _.map(nodes, value => value);
    return Object.assign(
      {},
      course.toJSON(),
      {
        branches: transformedBranches,
        nodes: transformedNodes,
      },
    );
  });
  return transformedCourses;
};

const nodes = async (obj, args, context) => {
  const { courseId, checksums } = args;
  const foundNodes = await context.mongo.models.course.fetchNodes(courseId, checksums);
  return foundNodes;
};

const createBranch = async (obj, args, context) => {
  const { courseId, branchName, parent } = args.input;
  const createdBranch = await context.mongo.models
    .course.createBranch(courseId, branchName, parent);
  return createdBranch;
};

const createNode = async (obj, args, context) => {
  const { courseId, branchName, node: nodeToBeCreated } = args;
  const createdNode = await context.mongo.models
    .course.createNode(courseId, branchName, nodeToBeCreated);
  return createdNode;
};

const CourseResolver = {
  Query: {
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
