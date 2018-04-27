import { mergeSchemas } from 'graphql-tools';
import { CourseSchema } from './course';

const schema = mergeSchemas({
  schemas: [CourseSchema],
});

export default schema;
export { schema };
