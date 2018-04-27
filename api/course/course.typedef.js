const CourseTypeDef = `
type Node {
  # Gets the courseId
  courseId: String!
  # Title of the node
  title: String!
  # Description of the node
  description: String
  # Checksum of the node
  checksum: String!
  # Type of the node
  nodeType: String!
  # Exists if the node is of type Blob
  blobType: String
  # Url of the Node
  url: String
  # A List of Children
  children: [Node]
}

type Branch {
  # Title of the branch
  title: String!
  # Root node of the branch
  root: Node
}

type Course {
  # Title of the Course
  title: String!
  # Refers to the root node of the Course
  root: Node
  # Refers to the courseId of the Course
  courseId: String!
  # Description of the Course
  description: String!
  # Branches of all the courses
  branches: [Branch]
  # Gets all the nodes of the course matching the checksums
  nodes(checksums: [String]): [Node]
}

type User {
  # UserId of the USer
  userId: String!
  # All the courses of user
  courses: [Course]
  # A specific course user subscribed to
  course(courseId: String): Course
}

input CourseInput {
  # Title of the course to be created
  title: String!
  # Description of the course to be created
  description: String!
}

input NodeInput {
  # Title of the Node
  title: String!
  # Description of the Node
  description: String!
  # Type of the node, can either be Tree or Blob
  nodeType: String!
  # Refers to the type of the blob can be VIDEO, WEBLINK, MARKDOWN
  blobType: String
  # The url to the blob content
  url: String
  # Path at which the node should be created
  path: String!
}

input BranchInput {
  # CourseId in which the branch needs to be created
  courseId: String!
  # Name of the branch to be created
  branchName: String!
  # Parent of the current branch
  parent: String!
}

type Query {
  # Gets all the courses in the store
  courses: [Course]
  # Gets the User
  user(userId: String!): User
  # Gets the course by courseID
  course(courseId: String!): Course
  # Gets the node by checksum
  nodes(courseId: String!, checksums: [String]): [Node]
}

type Mutation {
  # Creates a new course in platform
  createCourse(input: CourseInput): Course
  # Creates a new branch in the course
  createBranch(input: BranchInput): Branch
  # Creates a new node in branch of the course
  createNode(courseId: String, branchName: String, node: NodeInput): Node
}
`;

export default CourseTypeDef;
export { CourseTypeDef };
