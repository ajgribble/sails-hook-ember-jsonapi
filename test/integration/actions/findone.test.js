import supertest from 'supertest';

describe('Integration | Action | findone', function() {
  describe(':: response format', function() {
    it('should respond with status code 200', function(done) {
      supertest(sails.hooks.http.app)
        .get('/articles/1')
        .expect(200)
        .end(done);
    });
    /* TODO: Handle errors correctly, not currently a feature of json-api-serializer
    it('should respond with status code 404', function(done) {
      supertest(sails.hooks.http.app)
        .get('/articles/999')
        .expect(404)
        .expect(res => {
          expect(res.body.errors.length).to.equal(1);
          expect(res.body.errors[0].status).to.equal('404');
          expect(res.body.errors[0].title).to.equal('Not Found');
          expect(res.body.errors[0].detail).to.equal('No record found with the specified id');
        })
        .end(done);
    });
    */
    it('should respond with Content-Type application/vnd.api+json', function(done) {
      supertest(sails.hooks.http.app)
        .get('/articles/1')
        .expect(res => {
          expect(res.headers['content-type']).to.contain('application/vnd.api+json');
        })
        .end(done);
    });
    it('should return an object as root response value', function(done) {
      supertest(sails.hooks.http.app)
        .get('/articles/1')
        .expect(res => {
          expect(res.body).to.be.an.instanceof(Object);
        })
        .end(done);
    });
    it('should return a links object containing a self reference', function(done) {
      supertest(sails.hooks.http.app)
        .get('/articles/1')
        .expect(res => {
          expect(res.body.data.links.self).to.equal('http://localhost:1337/articles/1');
        })
        .end(done);
    });
    it('should return a data object representing a single resource object', function(done) {
      supertest(sails.hooks.http.app)
        .get('/articles/1')
        .expect(res => {
          expect(res.body.data).to.be.an.instanceof(Object);
        })
        .end(done);
    });
  });

  describe(':: data integrity', function() {
    it('should return 1 article', function(done) {
      supertest(sails.hooks.http.app)
        .get('/articles/1')
        .expect(res => {
          const { attributes, id, relationships, type } = res.body.data;

          expect(id).to.equal('1');
          expect(type).to.equal('articles');
          expect(attributes.title).to.include('XML');
          expect(attributes['created-at']).to.exist;

          expect(relationships.author.data.type).to.equal('authors');
          expect(relationships.author.links.self).to.equal('http://localhost:1337/articles/1/author');
          expect(relationships.author.links.related).to.equal('http://localhost:1337/articles/1/author');

          expect(relationships.comments.data.length).to.equal(3);
          expect(Object.keys(relationships.comments.data[0])).to.deep.equal(['type', 'id']);
          expect(relationships.comments.links.self).to.equal('http://localhost:1337/articles/1/comments');
          expect(relationships.comments.links.related).to.equal('http://localhost:1337/articles/1/comments');

          expect(attributes.createdAt).to.not.exist;
          expect(attributes.author).to.not.exist;

          expect(res.body.errors).to.not.exist;
          // TODO: handle included documents expect(res.body.included).to.not.exist;
        })
        .end(done);
    });

    it.only('should only include author data', function(done) {
      supertest(sails.hooks.http.app)
        .get('/articles/1?include=author')
        .expect(res => {
          const { included } = res.body;

          expect(included).to.have.length(1);
          expect(included[0].type).to.equal('author');
          expect(included[0].attributes.name).to.equal('Bob');
          expect(included[0].attributes.age).to.equal(46);
        })
        .end(done);
    });

    it('should include both author and comments', function(done) {

    });
  });

  describe(':: query functions', function() {
    /* TODO: handle errors and the included query param
    it('should support the "include" query param for a single one-to-many relationship', function(done) {
      supertest(sails.hooks.http.app)
        .get('/articles/1?include=comments')
        .expect(res => {
          const { errors, included } = res.body;

          expect(included.length).to.equal(2);
          expect(included.map(item => item.type)).to.deep.equal(['comments', 'comments']);
          expect(Object.keys(included[0])).to.deep.equal(['id', 'type', 'attributes', 'links', 'relationships']);

          expect(included[0].id).to.equal('1');
          expect(included[0].attributes.text).to.equal('Nice article!');
          expect(included[0].attributes.article).to.not.exist;
          expect(included[0].attributes.author).to.not.exist;

          expect(included[0].relationships.author.data.id).to.equal('2');
          expect(included[0].relationships.author.data.type).to.equal('author');
          expect(included[0].relationships.article.data.id).to.equal('1');
          expect(included[0].relationships.article.data.type).to.equal('article');

          expect(included[0].links.self).to.equal('http://localhost:1337/comments/1');

          expect(errors).to.not.exist;
        })
        .end(done);
    });
    */
    it('should not honor additional query params', function(done) {
      supertest(sails.hooks.http.app)
        .get('/articles/1?title=XML')
        .expect(404)
        .end(done);
    });
  });
});
