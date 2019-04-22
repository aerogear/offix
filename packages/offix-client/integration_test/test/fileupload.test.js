import { textFileContent, encodedImage } from './fixtures/test_file_contents'
import { createClient } from '../../dist';
import { TestStore } from '../utils/testStore';
import { ToggleableNetworkStatus } from '../utils/network';
import server from '../utils/server';
import {
  UPLOADS,
  UPLOAD_FILE
} from '../utils/graphql.queries';

const newNetworkStatus = (online = true) => {
  const networkStatus = new ToggleableNetworkStatus();
  networkStatus.setOnline(online);
  return networkStatus;
};

const newClient = async (clientOptions = {}) => {
  const config = {
    httpUrl: "http://localhost:4000/graphql",
    wsUrl: "ws://localhost:4000/graphql",
    ...clientOptions,
    fileUpload: true
  };

  return await createClient(config);
};

describe('File upload', function () {

  this.timeout(2000);
  

  let client, networkStatus, store;
  let numberOfUploadedFiles = 0;

  before('start server', async function () {
    await server.start();
  });

  after('stop server', async function() {
    await server.stop();
  });

  beforeEach('create client', async function () {
    networkStatus = newNetworkStatus();
    store = new TestStore();
    client = await newClient({ networkStatus, storage: store });
  });

  async function fileUpload(file) {
    return await client.mutate({
      mutation: UPLOAD_FILE,
      variables: { file }
    });
  }

  describe('uploading of text file', function () {

    const file = {
      filename: "testfile.txt",
      type: "text/plain",
      content: encodedImage
    }

    it('should succeed when text file is uploaded', async function () {

      let fileObject = new File([file.content], file.filename, {type: file.type, lastModified: new Date()})

      const res = await fileUpload(fileObject);
      expect(res.data.singleUpload).to.exist;
      expect(res.data.singleUpload.filename).to.exist;
      expect(res.data.singleUpload.filename).to.equal(file.filename);

      numberOfUploadedFiles++;
    });

    it('text file should be present in the list of uploaded files and contain correct metadata', async function () {
      const res = await client.query({
        query: UPLOADS
      });
      expect(res.data.uploads).to.exist;
      expect(res.data.uploads.length).to.equal(numberOfUploadedFiles);
    });
  });

  describe('uploading of image file', function () {

    const file = {
      filename: "testfile.png",
      type: "image/png",
      content: textFileContent
    }

    it('should succeed when image file is uploaded', async function () {

      let fileObject = new File([file.content], file.filename, {type: file.type, lastModified: new Date()})
      const res = await fileUpload(fileObject);
      expect(res.data.singleUpload).to.exist;
      expect(res.data.singleUpload.filename).to.exist;
      expect(res.data.singleUpload.filename).to.equal(file.filename);

      numberOfUploadedFiles++;
    });

    it('image file should be present in the list of uploaded files and contain correct metadata', async function () {
      const res = await client.query({
        query: UPLOADS
      });
      expect(res.data.uploads).to.exist;
      expect(res.data.uploads.length).to.equal(numberOfUploadedFiles);
    });
  });


});
