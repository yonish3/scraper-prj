const express = require("express");
const router = express.Router();

const request = require('request');
const Article = require('../model/Article');

//new packages for Mercury
const Mercury = require('@postlight/mercury-parser');

const Scraper = require('../model/ScraperArticle');
const mainScraper = require('../scraper/mainScraper');

router.get('/articles/:vertical', async function (req, res) {
  let vertical = req.params.vertical;
  let articlesArr = await Article.find({ vertical });
  res.send(articlesArr);
});

router.post('/newsapi', async function(req, res) {
  newsAPIKey = '0b8fc17ccb004aa0b44543dab7dbb353';
  let topic = req.query.q;
  let url = `https://newsapi.org/v2/top-headlines?country=us&category=${topic}&apiKey=${newsAPIKey}`;

  request(url, async function(err, response) {
    let articleArrData = JSON.parse(response.body);
    // console.log(articleArrData.articles);

    articleArrData.articles.forEach(async a => {
      let newApiArticle = new Article({
        vertical: topic,
        topic: null,
        date_published: a.publishedAt,
        author: a.author,
        title: a.title,
        domain: a.source.name,
        discription: a.description,
        lead_image_url: a.urlToImage,
        url: a.url,
        content: await Mercury.parse(a.url, { contentType: 'Markdown' }),
        word_count: null
      });

      newApiArticle.save();
      res.end();
    });
  });
});

//scraper

const saveScraperToDb = async function(){
  
  const articleArray = await mainScraper()

  articleArray.forEach( sa => {

    let newApiArticle = new Scraper({

      vertical: "sport",
      topic: null,
      date_published: sa.date_published,
      author: sa.author,
      title: sa.title,
      domain: null,
      discription: sa.description,
      lead_image_url: null,
      url: sa.url,
      content: sa.content,
      word_count: null,
       
    })
    newApiArticle.save()
  })
}

router.get('/scrap/', async function (req, res) {
  let check = await saveScraperToDb()
})

module.exports = router

