import _ from 'lodash';
import should from 'should';
import mongoose from 'mongoose';
import { config } from '../../../config';

import { CourseModel, NodeModel } from '../../../api/course';

/**
 * @async
 * @returns {Course} Course
 * @summary Mocks the addition of new course.
 */
const mockAdditionOfNewCourse = async () => {
  const course = await CourseModel.createCourse('Fundamentals of NodeJS', 'This course teaches fundamentals of NodeJS');
  return course;
};

/**
 * @async
 * @returns {Course}
 * @summary Mocks addition of blob to root of master branch
 */
const mockAdditionOfBlobAtRootOfMaster = async () => {
  const course = await mockAdditionOfNewCourse();
  const node = {
    title: 'Test Node',
    description: 'This node is for testing nodes',
    nodeType: 'BLOB',
    blobType: 'VIDEO',
    url: 'http://testurl.com',
  };
  const root = _.head(course.branches.master.commits).checksum;
  const courseWithAddedNode = await CourseModel.addNode(course.courseId, 'master', node, [root]);
  return courseWithAddedNode;
};

const mockCreationOfBlobAtRootOfMaster = async () => {
  const course = await mockAdditionOfNewCourse();
  const node = {
    title: 'Test Node',
    description: 'This node is for testing nodes',
    nodeType: 'BLOB',
    blobType: 'VIDEO',
    url: 'http://testurl.com',
  };
  const root = _.head(course.branches.master.commits).checksum;
  const createdNode = await CourseModel.createNode(course.courseId, 'master', node, [root]);
  return createdNode;
};

const mockAdditionOfBranchInCourse = async (branchName, parent) => {
  const course = await mockAdditionOfNewCourse();
  const courseWithAddedBranch = await CourseModel.addBranch(course._id, branchName, parent);
  return courseWithAddedBranch;
};

const mockCreationOfBranchInCourse = async (branchName, parent) => {
  const course = await mockAdditionOfNewCourse();
  const createdBranch = await CourseModel.createBranch(course.courseId, branchName, parent);
  return createdBranch;
};

const mockAdditionOfNodeInNewBranch = async (branchName, parent) => {
  const courseWithNewBranch = await mockAdditionOfBranchInCourse(branchName, parent);
  const node = {
    title: 'Test Node 1',
    nodeType: 'BLOB',
    blobType: 'VIDEO',
    url: 'http://testurl1.com',
  };
  const rootTree = _.last(courseWithNewBranch.branches[branchName].commits).checksum;
  const courseWithAddedNode = await CourseModel
    .addNode(courseWithNewBranch._id, branchName, node, [rootTree]);
  return courseWithAddedNode;
};

const mockAdditionOfTreeAtRootOfMaster = async (node) => {
  const course = await mockAdditionOfNewCourse();
  const root = _.head(course.branches.master.commits).checksum;
  const courseWithAddedNode = await CourseModel.addNode(course._id, 'master', node, [root]);
  return courseWithAddedNode;
};

const mockAdditionOfBlobToTree = async (treeNode, blobNode) => {
  const course = await mockAdditionOfTreeAtRootOfMaster(treeNode);
  const root = _.last(course.branches.master.commits).checksum;
  const treeTypeNode = _.head(course.nodes[root].children);
  const path = [root, treeTypeNode];
  const courseWithAddedNode = await CourseModel.addNode(course._id, 'master', blobNode, path);
  return courseWithAddedNode;
};

const mockDeletionOfBlobFromTree = async (treeNode, blobNode) => {
  const courseWithAddedNodes = await mockAdditionOfBlobToTree(treeNode, blobNode);
  const { checksum: rootNodeChecksum } = _.last(courseWithAddedNodes.branches.master.commits);
  const { checksum: treeNodeModelChecksum } = new NodeModel(treeNode);
  const { checksum: blobNodeModelChecksum } = new NodeModel(blobNode);
  const path = [rootNodeChecksum, treeNodeModelChecksum, blobNodeModelChecksum];
  const courseWithDeletedNodes = await CourseModel.deleteNode(courseWithAddedNodes.courseId, 'master', path);
  return courseWithDeletedNodes;
};

jest.setTimeout(15000);

describe('Course Model', () => {
  beforeAll(async () => {
    await mongoose.connect(`${config.MONGODB_URL}/test`, {
      autoReconnect: true,
      reconnectTries: Number.MAX_VALUE,
    });
  });

  test('Should be able to create course', async () => {
    const course = await mockAdditionOfNewCourse();
    should.exist(course);
    course.should.have.properties(['title', 'description', 'head', 'branches', 'nodes']);
    course.branches.master.commits.length.should.be.exactly(1);
    const commit = course.branches.master.commits[0];
    should.exist(course.nodes[commit.checksum]);
  });

  test('Should be able to add blob type node', async () => {
    const courseWithAddedNode = await mockAdditionOfBlobAtRootOfMaster();
    courseWithAddedNode.branches.master.commits.length.should.be.exactly(2);
    _.keys(courseWithAddedNode.nodes).length.should.be.exactly(3);
  });

  test('Should be able to create a node and return the createdNode', async () => {
    const createdNode = await mockCreationOfBlobAtRootOfMaster();
    createdNode.should.have.properties(['title', 'nodeType', 'blobType', 'url', 'concepts']);
  });

  test('Should be able to create a new branch in the course', async () => {
    const branchName = 'Attention on Basics';
    const courseWithAddedBranch = await mockAdditionOfBranchInCourse(branchName, 'master');
    _.keys(courseWithAddedBranch.branches).length.should.be.exactly(2);
    courseWithAddedBranch.branches[branchName].commits.length.should.be.exactly(1);
    const lastCommit = _.last(courseWithAddedBranch.branches['Attention on Basics'].commits).checksum;
    courseWithAddedBranch.nodes[lastCommit].children.length.should.be.exactly(0);
  });

  test('Should be able to create a new branch, with default value of parentBranch as master', async () => {
    const branchName = 'Attention on Basics';
    const courseWithAddedBranch = await mockAdditionOfBranchInCourse(branchName);
    _.keys(courseWithAddedBranch.branches).length.should.be.exactly(2);
    courseWithAddedBranch.branches[branchName].commits.length.should.be.exactly(1);
    const lastCommit = _.last(courseWithAddedBranch.branches['Attention on Basics'].commits).checksum;
    courseWithAddedBranch.nodes[lastCommit].children.length.should.be.exactly(0);
  });

  test('Should be able to create a new branch and return createdBranch, with default value of parentBranch as master', async () => {
    const branchName = 'Attention on Basics';
    const createdBranch = await mockCreationOfBranchInCourse(branchName);
    createdBranch.should.have.properties(['title', 'root']);
    createdBranch.root.should.have.properties(['title', 'nodeType', 'children', 'concepts']);
  });

  test('Should be able to add a new node in the new branch in the course', async () => {
    const branchName = 'Attention on Basics';
    const parent = 'master';
    const courseWithAddedNode = await mockAdditionOfNodeInNewBranch(branchName, parent);
    courseWithAddedNode.branches[branchName].commits.length.should.be.exactly(2);
    const lastCommit = _.last(courseWithAddedNode.branches[branchName].commits).checksum;
    courseWithAddedNode.nodes[lastCommit].children.length.should.be.exactly(1);
  });

  test('Should be able to add tree type node', async () => {
    const node = {
      title: 'Test Folder',
      nodeType: 'tree',
    };
    const { checksum } = new NodeModel(node);
    const courseWithAddedNode = await mockAdditionOfTreeAtRootOfMaster(node);
    courseWithAddedNode.branches.master.commits.length.should.be.exactly(2);
    _.keys(courseWithAddedNode.nodes).length.should.be.exactly(3);
    const addedNode = courseWithAddedNode.nodes[checksum];
    addedNode.should.have.properties(['title', 'nodeType', 'checksum', 'children', 'concepts']);
    addedNode.title.should.be.exactly(node.title);
    addedNode.nodeType.should.be.exactly(node.nodeType);
    addedNode.checksum.should.be.exactly(checksum);
    addedNode.children.length.should.be.exactly(0);
    addedNode.concepts.length.should.be.exactly(0);
  });

  test('Should be able to create a nested node, say a blob type node inside a tree node', async () => {
    const blobNode = {
      title: 'Test Node',
      nodeType: 'blob',
      blobType: 'VIDEO',
      url: 'www.youtube.com/rxksff',
    };
    const treeNode = {
      title: 'Test Folder',
      nodeType: 'tree',
    };
    const courseWithAddedBlobUnderTree = await mockAdditionOfBlobToTree(treeNode, blobNode);
    _.keys(courseWithAddedBlobUnderTree.branches).length.should.be.exactly(1);
    // First Commit occurs when the course gets created, because of a default tree type node
    // Second Commit occurs when we create a tree type node under the existing node
    // Third Commit occurs when we create a node under the tree
    courseWithAddedBlobUnderTree.branches.master.commits.length.should.be.exactly(3);
    const lastCommit = _.last(courseWithAddedBlobUnderTree.branches.master.commits).checksum;
    const rootTree = courseWithAddedBlobUnderTree.nodes[lastCommit];
    const createdTreeNode = courseWithAddedBlobUnderTree.nodes[rootTree.children[0]];
    const createdBlobTree = courseWithAddedBlobUnderTree.nodes[createdTreeNode.children[0]];
    createdTreeNode.should.have.properties(['title', 'nodeType', 'children', 'checksum', 'concepts']);
    createdTreeNode.nodeType.should.be.exactly('tree');
    createdTreeNode.title.should.be.exactly(treeNode.title);
    createdBlobTree.nodeType.should.be.exactly('blob');
    createdBlobTree.title.should.be.exactly('Test Node');
    createdBlobTree.blobType.should.be.exactly('VIDEO');
    createdBlobTree.concepts.length.should.be.exactly(0);
  });

  test('Should be able to get all the nodes from the course', async () => {
    const courseWithAddedNodes = await mockAdditionOfBlobAtRootOfMaster();
    const fetchedNodes = await CourseModel.fetchNodes(courseWithAddedNodes._id);
    should.exist(fetchedNodes);
    fetchedNodes.should.be.an.instanceOf(Array);
    fetchedNodes.length.should.be.above(0);
  });

  test('Should be able to get nodes from the course', async () => {
    const courseWithAddedNodes = await mockAdditionOfBlobAtRootOfMaster();
    const checksums = _.keys(courseWithAddedNodes.nodes);
    const fetchedNodes = await CourseModel.fetchNodes(courseWithAddedNodes._id, checksums);
    fetchedNodes.should.be.an.instanceOf(Array);
    fetchedNodes.length.should.be.above(0);
  });

  test('Should be able to remove nodes from the course', async () => {
    const blobNode = {
      title: 'Test Node',
      nodeType: 'blob',
      blobType: 'VIDEO',
      url: 'www.youtube.com/rxksff',
    };
    const treeNode = {
      title: 'Test Folder',
      nodeType: 'tree',
    };
    const { checksum: blobNodeModelChecksum } = new NodeModel(blobNode);
    const courseWithDeletedNodes = await mockDeletionOfBlobFromTree(treeNode, blobNode);
    should.exist(courseWithDeletedNodes);
    should.exist(courseWithDeletedNodes.nodes[blobNodeModelChecksum]);
    const { checksum: rootNodeChecksum } = _.last(courseWithDeletedNodes.branches.master.commits);
    should.exist(courseWithDeletedNodes.nodes[rootNodeChecksum]);
    const rootNodesChildChecksum = _.last(courseWithDeletedNodes.nodes[rootNodeChecksum].children);
    courseWithDeletedNodes.nodes[rootNodesChildChecksum].children.length.should.be.exactly(0);
  });

  afterAll(async () => {
    await mongoose.connection.db.dropDatabase('test');
    await mongoose.connection.close();
    await mongoose.connection.db.close();
  });
});
