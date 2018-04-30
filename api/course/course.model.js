/**
 * @fileOverview Defines the Course Model
 * @author Nishant Jain
 */

import mongoose from 'mongoose';
import crypto from 'crypto';
import _ from 'lodash';

import { NodeModel } from './node.model';

/**
 * @summary Schema for the Course Model
 */
const CourseSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
  },
  description: {
    type: String,
    required: true,
  },
  head: {
    type: String,
    default: 'master',
  },
  branches: {
    type: mongoose.Schema.Types.Mixed,
    default: {},
  },
  nodes: {
    type: mongoose.Schema.Types.Mixed,
    default: {},
  },
}, { toJSON: { virtuals: true } });

/**
 * Given an object, it stringifies the object and
 * returns with a checksum.
 * @param {Object} object
 * @returns {String} checksum
 * @summary Computes the checksum of a given object
 */
CourseSchema.statics.createChecksum = object => crypto
  .createHash('sha256')
  .update(JSON.stringify(object))
  .digest('hex');

/**
 * Add a new node in course by performing these 3 operations
 * 1. Get the Course
 * 2. Add a new node and update all the ancestors
 * 3. Update the course in the database
 * @async
 * @param {String} courseId Id of the cours
 * @param {String} branchName Name of the branch in the course
 * @param {Object} nodeToBeCreated Node to be added
 * @param {Array} path Path at which node is to be added
 * @returns {Course} course
 * @summary Adds Node in the course.
 */
CourseSchema.statics.addNode = async function addNode(courseId, branchName, nodeToBeCreated, path) {
  // Get the course
  const course = await this.findOne({ _id: courseId }).exec();
  const pathWithNullAtHead = _.concat([null], path);

  // Add the node and update all its ancestors
  const rootNode = _.reduceRight(
    pathWithNullAtHead,
    ({ checksumOfNodeToBeRemoved, nodeToBeAdded }, currentPath) => {
      const node = new NodeModel(nodeToBeAdded);
      course.nodes[node.checksum] = node;
      if (currentPath) {
        const nodeAtCurrentPath = _.cloneDeep(course.nodes[currentPath]);
        nodeAtCurrentPath.children = _.without(
          nodeAtCurrentPath.children,
          checksumOfNodeToBeRemoved,
        );
        nodeAtCurrentPath.children = _.concat(nodeAtCurrentPath.children, node.checksum);
        return {
          checksumOfNodeToBeRemoved: nodeAtCurrentPath.checksum,
          nodeToBeAdded: _.omit(nodeAtCurrentPath, 'checksum'),
        };
      }
      return node;
    },
    { checksumOfNodeToBeRemoved: null, nodeToBeAdded: nodeToBeCreated },
  );
  const commit = {
    timestamp: +new Date(),
    checksum: rootNode.checksum,
  };
  course.branches[branchName].commits.push(commit);

  // Update the course in the database
  const updatedCourse = await this.findOneAndUpdate({ _id: courseId }, course, { new: true });
  return updatedCourse;
};

/**
 * @async
 * @param {String} courseId Id of the course
 * @param {String} branchName Name of the branch in the course to be updated.
 * @param {String} path Path at which the node is to be removed.
 * @returns {Course} course
 * @summary Removes Nodes in the course
 */
CourseSchema.statics.deleteNode = async function deleteNode(courseId, branchName, path) {
  const course = await this.findOne({ _id: courseId }).exec();
  const nodeToBeRemoved = _.last(path);
  const pathWithLastNodeRemoved = _.initial(path);
  const pathWithNullAtHead = _.concat([null], pathWithLastNodeRemoved);
  const rootNode = _.reduceRight(
    pathWithNullAtHead,
    ({ checksumOfNodeToBeRemoved, nodeToBeAdded }, currentPath) => {
      let node;
      if (nodeToBeAdded) {
        node = new NodeModel(nodeToBeAdded);
        course.nodes[node.checksum] = node;
      }
      if (currentPath) {
        const nodeAtCurrentPath = _.cloneDeep(course.nodes[currentPath]);
        nodeAtCurrentPath.children =
          _.without(nodeAtCurrentPath.children, checksumOfNodeToBeRemoved);
        nodeAtCurrentPath.children = node ?
          _.concat(nodeAtCurrentPath.children, node.checksum) :
          nodeAtCurrentPath.children;
        return {
          checksumOfNodeToBeRemoved: nodeAtCurrentPath.checksum,
          nodeToBeAdded: _.omit(nodeAtCurrentPath, 'checksum'),
        };
      }
      return node;
    },
    { checksumOfNodeToBeRemoved: nodeToBeRemoved, nodeToBeAdded: null },
  );
  const commit = {
    timestamp: +new Date(),
    checksum: rootNode.checksum,
  };
  course.branches[branchName].commits.push(commit);
  const updatedCourse = await this.findOneAndUpdate({ _id: courseId }, course, { new: true });
  return updatedCourse;
};

/**
 * @summary Gets the courseId
 * @returns courseId
 */
CourseSchema.virtual('courseId').get(function getCourseId() {
  return this._id;
});

/**
 * @see {@link CourseSchema.statics.addNode}
 * @returns {Node} node
 */
CourseSchema.statics.createNode = async function
createNode(courseId, branchName, nodeToBeCreated, path) {
  const courseWithCreatedNode = await this.addNode(courseId, branchName, nodeToBeCreated, path);
  const nodeModel = new NodeModel(nodeToBeCreated);
  const node = _.assign(courseWithCreatedNode.nodes[nodeModel.checksum], courseId);
  return node;
};

/**
 * Initializes Branch with commits in a Course
 * @param {Object} course
 * @param {String} branch
 * @param {String} parent
 * @returns {Course} Course with updated nodes and branches.
 */
CourseSchema.statics.initializeBranchWithCommits = function
initializeBranchWithCommits(course, branchName, parentBranchName) {
  const courseCopy = _.cloneDeep(course);
  courseCopy.branches[branchName] = {};
  courseCopy.branches[branchName].parent = parentBranchName;
  const node = new NodeModel({ nodeType: 'tree', title: courseCopy.title });
  courseCopy.nodes[node.checksum] = node;
  const commit = {
    timestamp: +new Date(),
    checksum: node.checksum,
  };
  courseCopy.branches[branchName].commits = parentBranchName ?
    course.branches[parentBranchName].commits :
    [commit];
  return courseCopy;
};

/**
 * Creates a branch in the course.
 * If supplied with the parentBranchName, then it clones the parent branch to
 * the branch to be created.
 * @async
 * @param {String} courseId
 * @param {String} branchName
 * @param {String} parentBranchName
 * @summary Adds a new branch to the course.
 */
CourseSchema.statics.addBranch = async function addBranch(courseId, branchName, parentBranchName = 'master') {
  const course = await this.findOne({ _id: courseId }).exec();
  const courseWithBranchInitalized = this.initializeBranchWithCommits(
    course,
    branchName,
    parentBranchName,
  );
  const updatedCourse = await this.findByIdAndUpdate(
    { _id: courseId },
    courseWithBranchInitalized,
    { new: true },
  ).exec();
  return updatedCourse;
};

/**
 * @see {@link CourseSchema.statics.addBranch}
 * @returns {Object} Branch
 */
CourseSchema.statics.createBranch = async function createBranch(courseId, branchName, parentBranchName = 'master') {
  const courseWithBranchAdded = await this.addBranch(courseId, branchName, parentBranchName);
  const { branches } = courseWithBranchAdded;
  const rootOfBranch = courseWithBranchAdded.nodes[_.last(branches[branchName].commits).checksum];
  const addedBranch = {
    title: branchName,
    root: rootOfBranch,
  };
  return addedBranch;
};

/**
 * Creates a new Course.
 * By default it intializes course with a
 * 1. Master branch
 * 2. A node of nodeType tree
 * 3. A commit in the master branch referring to the node created.
 * Returns with the created course.
 * @async
 * @param {String} title
 * @param {String} description
 * @returns {Course} course
 */
CourseSchema.statics.createCourse = async function createCourse(title, description) {
  const courseToBeCreated = new this({ title, description });
  const courseWithUpdatedBranch = this.initializeBranchWithCommits(courseToBeCreated, 'master');
  const createdCourse = await this(courseWithUpdatedBranch).save();
  return createdCourse;
};

/**
 * Fetches all nodes with matching checksum present in checksums
 * @async
 * @param {String} courseId
 * @param {Array} checksums
 * @returns {[Nodes]} Nodes
 * @summary Returns a collection of node matching with checksum in checksums collection.
 */
CourseSchema.statics.fetchNodes = async function findNodes(courseId, checksums) {
  const foundCourse = await this.findOne({ _id: courseId }).exec();
  const foundNodes = checksums ?
    _.map(checksums, checksum => foundCourse.nodes[checksum]) : _.values(foundCourse.nodes);
  return foundNodes;
};

const CourseModel = mongoose.model('course', CourseSchema);

export default CourseModel;
export { CourseSchema, CourseModel };
