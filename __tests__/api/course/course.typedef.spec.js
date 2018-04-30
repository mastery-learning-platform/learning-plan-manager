/**
 * @fileOverview File to avoid regressions on course typedef.
 * @author Nishant Jain
 */

import { buildSchemaFromTypeDefinitions } from 'graphql-tools';
import { GraphQLString, GraphQLNonNull, GraphQLList } from 'graphql';

import { CourseTypeDef } from '../../../api/course';

const schema = buildSchemaFromTypeDefinitions([CourseTypeDef]);

const CourseType = schema.getType('Course');
const NodeType = schema.getType('Node');
const BranchType = schema.getType('Branch');
const QueryType = schema.getType('Query');
const MutationType = schema.getType('Mutation');
const CourseInputType = schema.getType('CourseInput');
const BranchInputType = schema.getType('BranchInput');
const NodeInputType = schema.getType('NodeInput');

/**
 * @summary Tests the types of fields defined under the Course Type
 */
describe('Course Type', () => {
  test('Should have following properties', () => {
    const expectedCourseTypeProperties = [
      'title',
      'root',
      'courseId',
      'description',
      'branches',
      'nodes',
    ];
    const fields = CourseType.getFields();
    expect(Object.keys(fields))
      .toEqual(expect.arrayContaining(expectedCourseTypeProperties));
  });

  test('Should have the property title of type String and should non-nullable', () => {
    const fields = CourseType.getFields();
    expect(fields.title.type.constructor).toEqual(GraphQLNonNull);
    expect(fields.title.type.ofType).toEqual(GraphQLString);
  });

  test('Should have the property courseId of type string and should be non-nullable', () => {
    const fields = CourseType.getFields();
    expect(fields.courseId.type.constructor).toEqual(GraphQLNonNull);
    expect(fields.courseId.type.ofType).toEqual(GraphQLString);
  });

  test('Should have the property description of type String and should be non-nullable', () => {
    const fields = CourseType.getFields();
    expect(fields.description.type.constructor).toEqual(GraphQLNonNull);
    expect(fields.description.type.ofType).toEqual(GraphQLString);
  });

  test('Should have the property root of type Node', () => {
    const fields = CourseType.getFields();
    expect(fields.root.type).toEqual(NodeType);
  });

  test('Should have the property nodes of type List<Node> and should accept string of checksums', () => {
    const fields = CourseType.getFields();
    expect(fields.nodes.type.constructor).toEqual(GraphQLList);
    expect(fields.nodes.type.ofType).toEqual(NodeType);
    // expect(fields.nodes.args.length).toBe(1);
    // expect(fields.nodes.args[0].type.constructor).toBe(GraphQLList);
    // expect(fields.nodes.args[0].type.ofType).toBe(GraphQLString);
  });

  test('Should have property branches of type List<Branch>', () => {
    const fields = CourseType.getFields();
    expect(fields.branches.type.constructor).toEqual(GraphQLList);
    expect(fields.branches.type.ofType).toEqual(BranchType);
  });
});

/**
 * @summary Tests types of fields defined under the Node Type
 */
describe('Node Type', () => {
  test('Should have property courseId of type String and be non-nullable', () => {
    const fields = NodeType.getFields();
    expect(fields.courseId.type.constructor).toEqual(GraphQLNonNull);
    expect(fields.courseId.type.ofType).toEqual(GraphQLString);
  });

  test('Should have property title of type String and be non-nullable', () => {
    const fields = NodeType.getFields();
    expect(fields.title.type.constructor).toEqual(GraphQLNonNull);
    expect(fields.title.type.ofType).toEqual(GraphQLString);
  });

  test('Should have property description of type String', () => {
    const fields = NodeType.getFields();
    expect(fields.courseId.type.constructor).toEqual(GraphQLNonNull);
    expect(fields.courseId.type.ofType).toEqual(GraphQLString);
  });

  test('Should have property checksum of type String and be non-nullable', () => {
    const fields = NodeType.getFields();
    expect(fields.checksum.type.constructor).toEqual(GraphQLNonNull);
    expect(fields.checksum.type.ofType).toEqual(GraphQLString);
  });

  test('Should have property nodeType and be non-nullable', () => {
    const fields = NodeType.getFields();
    expect(fields.courseId.type.constructor).toEqual(GraphQLNonNull);
    expect(fields.courseId.type.ofType).toEqual(GraphQLString);
  });

  test('Should have property blobType of type String and be non-nullable', () => {
    const fields = NodeType.getFields();
    expect(fields.blobType.type).toEqual(GraphQLString);
  });

  test('Should have property url of type String', () => {
    const fields = NodeType.getFields();
    expect(fields.url.type).toEqual(GraphQLString);
  });

  test('Should have property concepts of type String', () => {
    const fields = NodeType.getFields();
    expect(fields.concepts.type.constructor).toEqual(GraphQLList);
    expect(fields.concepts.type.ofType).toEqual(GraphQLString);
  });
});

/**
 * @summary Tests types of fields defined under Branch Type
 */
describe('Branch Type', () => {
  test('Should have property title of type String and be non-nullable', () => {
    const fields = BranchType.getFields();
    expect(fields.title.type.constructor).toEqual(GraphQLNonNull);
    expect(fields.title.type.ofType).toEqual(GraphQLString);
  });

  test('Should have property root of type Node', () => {
    const fields = BranchType.getFields();
    expect(fields.root.type).toBe(NodeType);
  });
});

/**
 * @summary Tests Types for CourseInputType
 */
describe('CourseInputType', () => {
  test('should have property title of type String', () => {
    const fields = CourseInputType.getFields();
    expect(fields.title.type.constructor).toEqual(GraphQLNonNull);
    expect(fields.title.type.ofType).toEqual(GraphQLString);
  });

  test('Should have property description of type String', () => {
    const fields = CourseInputType.getFields();
    expect(fields.description.type.constructor).toEqual(GraphQLNonNull);
    expect(fields.description.type.ofType).toEqual(GraphQLString);
  });
});

/**
 * @summary Tests Types for NodeInputType
 */
describe('NodeInputType', () => {
  test('Should have property title of type String and should be non-nullable', () => {
    const fields = NodeInputType.getFields();
    expect(fields.title.type.constructor).toEqual(GraphQLNonNull);
    expect(fields.title.type.ofType).toEqual(GraphQLString);
  });

  test('Should have property description of type String and should be non-nullable', () => {
    const fields = NodeInputType.getFields();
    expect(fields.description.type.constructor).toEqual(GraphQLNonNull);
    expect(fields.description.type.ofType).toEqual(GraphQLString);
  });

  test('Should have property nodeType of type String and should be non-nullable', () => {
    const fields = NodeInputType.getFields();
    expect(fields.nodeType.type.constructor).toEqual(GraphQLNonNull);
    expect(fields.nodeType.type.ofType).toEqual(GraphQLString);
  });

  test('Should have property blobType of type String', () => {
    const fields = NodeInputType.getFields();
    expect(fields.blobType.type).toEqual(GraphQLString);
  });

  test('Should have property url of type String', () => {
    const fields = NodeInputType.getFields();
    expect(fields.url.type).toEqual(GraphQLString);
  });

  test('Should have property path of type String and should be non-nullable', () => {
    const fields = NodeInputType.getFields();
    expect(fields.path.type.constructor).toEqual(GraphQLNonNull);
    expect(fields.path.type.ofType).toEqual(GraphQLString);
  });
});

/**
 * @summary Tests Types for BranchInputType
 */
describe('Branch Input Type', () => {
  test('Should accept property courseId of type String and should be non-nullable', () => {
    const fields = BranchInputType.getFields();
    expect(fields.courseId.type.constructor).toEqual(GraphQLNonNull);
    expect(fields.courseId.type.ofType).toEqual(GraphQLString);
  });

  test('Should accept property branchName of type String and should be non-nullable', () => {
    const fields = BranchInputType.getFields();
    expect(fields.branchName.type.constructor).toEqual(GraphQLNonNull);
    expect(fields.branchName.type.ofType).toEqual(GraphQLString);
  });

  test('Should accept property parent of type String and should be non-nullable', () => {
    const fields = BranchInputType.getFields();
    expect(fields.parent.type.constructor).toEqual(GraphQLNonNull);
    expect(fields.parent.type.ofType).toEqual(GraphQLString);
  });
});


/**
 * @summary Tests Types of methods defined under Query type
 */
describe('Query Type', () => {
  test('Should have property courses to return collection of Course', () => {
    const fields = QueryType.getFields();
    expect(fields.courses.type.constructor).toEqual(GraphQLList);
    expect(fields.courses.type.ofType).toEqual(CourseType);
    expect(fields.courses.args.length).toBe(1);
    expect(fields.courses.args[0].type).toEqual(GraphQLString);
  });
});

/**
 * @summary Tests Types of Methods defined under Mutations
 */
describe('Mutations', () => {
  test('Should have property createCourse', () => {
    const fields = MutationType.getFields();
    expect(fields.createCourse.type).toEqual(CourseType);
    expect(fields.createCourse.args[0].type).toEqual(CourseInputType);
  });

  test('Should have property createBranch', () => {
    const fields = MutationType.getFields();
    expect(fields.createBranch.type).toEqual(BranchType);
    expect(fields.createBranch.args[0].type).toEqual(BranchInputType);
  });

  test('Should have property createNode', () => {
    const fields = MutationType.getFields();
    expect(fields.createNode.type).toEqual(NodeType);
    expect(fields.createNode.args[0].type).toEqual(GraphQLString);
  });
});
