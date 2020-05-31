const app = require('../src/app');
const articlesArray = require('./Fixtures/seed.blogful_test_articles')

describe('testing endpoint /', () => {
    it('GET / responds with 200',()=>{
        return supertest(app)
            .get('/')
            .expect(200)
    })
})

describe.only('endpoint /articles', ()=>{
    let db
    const testArticles = articlesArray()

    before(()=>{
        db = knex({
            client: 'pg',
            connection: process.env.TEST_DB_URL
        })
        app.set('db', db)
    })

    before(()=>db('blogful_articles').truncate())

    afterEach(()=>db('blogful_articles').truncate())

    after(()=>db.destroy())

    describe(`GET /articles`, () => {
        context(`Given no articles`, () => {
            it(`responds with 200 and an empty list`, () => {
            return supertest(app)
                .get('/articles')
                .expect(200, [])
            })
        })
        context('Given there are articles in the database', () => {
    
          beforeEach('insert articles', () => {
            return db
              .into('blogful_articles')
              .insert(testArticles)
          })
    
          it('responds with 200 and all of the articles', () => {
            return supertest(app)
              .get('/articles')
              .expect(200, testArticles)
          })
        })
      })
    
      describe(`GET /articles/:article_id`, () => {
        context(`Given no articles`, () => {
            it(`responds with 404`, () => {
            const articleId = 123456
            return supertest(app)
                .get(`/articles/${articleId}`)
                .expect(404, { error: { message: `Article doesn't exist` } })
            })
        })
        context('Given there are articles in the database', () => {
    
          beforeEach('insert articles', () => {
            return db
              .into('blogful_articles')
              .insert(testArticles)
          })
    
          it('responds with 200 and the specified article', () => {
            const articleId = 2
            const expectedArticle = testArticles[articleId - 1]
            return supertest(app)
              .get(`/articles/${articleId}`)
              .expect(200, expectedArticle)
          })
        })
      })
})