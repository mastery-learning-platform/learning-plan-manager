const createCourse = async (obj, args, context) => {
  const { title, description } = args.input;
  const createdCourse = await context.mongo.models.course.createCourse(title, description);
  return createdCourse;
};

const courses = async (obj, args, context) => {
  const foundCourses = await context.mongo.models.course.find({});
  return foundCourses;
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
