import crypto from 'crypto';
import mongoose from 'mongoose';

const NodeSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
  },
  nodeType: {
    type: String,
    enum: ['tree', 'blob'],
    required: true,
  },
  blobType: {
    type: String,
    enum: ['VIDEO', 'MARKDOWN', 'WEBLINK'],
  },
  url: String,
  checksum: {
    type: String,
  },
  children: {
    type: Array,
  },
}, {
  _id: false,
});

NodeSchema.path('children').default(function childrenDefault() {
  return this.nodeType === 'tree' ? [] : undefined;
});

NodeSchema.path('checksum').default(function checksumDefault() {
  const node = {
    title: this.title,
    nodeType: this.nodeType,
    blobType: this.blobType,
    url: this.url,
    children: this.children,
  };
  const stringifiedNode = JSON.stringify(node);
  return crypto
    .createHash('sha256')
    .update(stringifiedNode)
    .digest('hex');
});

const NodeModel = mongoose.model('node', NodeSchema);

export default NodeModel;
export { NodeSchema, NodeModel };
