import should from 'should';
import { NodeModel } from '../../api/course';

describe('Node', () => {
  it('Should be able to create a Node of nodetype Tree', () => {
    const node = new NodeModel({
      nodeType: 'tree',
      title: 'Fundamentals Of Programming',
    });
    should.exist(node);
    node.should.have.properties(['nodeType', 'title', 'checksum', 'children']);
    node.children.should.be.an.instanceOf(Array);
    node.children.length.should.be.exactly(0);
  });

  it('Should be able to create a Node of nodeType Blob', () => {
    const node = new NodeModel({
      nodeType: 'blob',
      title: 'Learning Promises',
      blobType: 'VIDEO',
      url: 'http://learningpromises.com',
    });
    should.exist(node);
    node.should.have.properties(['nodeType', 'title', 'checksum', 'blobType', 'url']);
    should.not.exist(node.children);
  });
});
