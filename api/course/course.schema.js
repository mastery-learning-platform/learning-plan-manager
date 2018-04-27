import { makeExecutableSchema } from 'graphql-tools';
import { CourseTypeDef as typeDefs } from './course.typedef';
import { CourseResolver as resolvers } from './course.resolver';

const CourseSchema = makeExecutableSchema({
  typeDefs,
  resolvers,
});

export default CourseSchema;
export { CourseSchema };
