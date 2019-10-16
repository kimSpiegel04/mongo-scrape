var express     = require('express'),
    logger      = require('morgan'),
    mongoose    = require('mongoose'),
    axios       = require('axios'),
    cheerio     = require('cheerio'),
    Article     = require('./models/Article'),
    Note        = require('./models/Note'),
    Favorite    = require('./models/Favorites');

var PORT = process.env.PORT || 3000;

var app = express();

app.use(logger("dev"));
app.use(express.urlencoded({ extended: true }));
app.set('view engine', 'ejs');
app.use(express.json());
app.use(express.static(__dirname+"/public"));

mongoose.connect("mongodb://localhost/mongoScraper", { useNewUrlParser: true });

// Route for homepage
app.get('/', function(req,res){
    res.render('landing');
});

////////////////////// * ARTICLES ////////////////////////////

// Scrape for articles
app.get('/scrape', function(req, res){

    axios.get("http://www.echojs.com/").then(function(response){
        var $ = cheerio.load(response.data);

        $("article h2").each(function(i, element){
            
            var result = {};

            result.title = $(this)
                .children("a")
                .text();
            result.link = $(this)
                .children("a")
                .attr("href");

            Article.create(result)
                .then(function(dbArticle){
                    console.log(dbArticle);
                })
                .catch(function(err){
                    console.log(err);
                });
        });
        res.send("Scrape Complete");
    });
});

// Route for getting all Articles from the db
app.get('/articles', function(req, res){

    Article.find({})
        .then(function(allArticles){
            res.render('articles/index', {articles: allArticles});
        })
        .catch(function(err){
            res.json(err);
        });
});


// Save article to favorites
app.get('/articles/:id', function(req,res){
    Article.findById(req.params.id, function(err,article){
        if(err){
            console.log(err);
            res.redirect('/articles');
        } else {
            res.json(article);
            // Favorite.create(article, function(error, newFavorite){
            //     if(error){
            //         console.log(error);
            //     } else {
            //         article.
            //         res.redirect('/favorites');
            //     }
            // });
        }
    });
});


// Show favorite articles
app.get('/favorites', function(req,res){
    Favorite.find({})
        .then(function(allFavorites){
            res.render('favorites/index', {favorites: allFavorites});
        })
        .catch(function(err){
            res.json(err);
        });
});

// Show single article and its notes
app.get('/favorites/:id', function(req,res){
    Article.findById(req.params.id)
        .populate('notes')
        .exec(function(err, foundArticle){
            if(err){
                console.log(err);
            } else {
                console.log(foundArticle);
                res.render('articles/show', {article: foundArticle});
            }
        });
});

// Delete favorite

////////////////////// * NOTES ////////////////////////////

// New note form
app.get('/favorites/:id/notes/new', function(req,res){
    Article.findById(req.params.id, function(err, article){
        if(err){
            console.log(err);
        } else {
            res.render('notes/new', {article: article});
        }
    });
});

// Create new note
app.post('/favorites/:id/notes', function(req,res){
    Article.findById(req.params.id, function(err, article){
        if(err){
            console.log(err);
            res.redirect('/favorites');
        } else {
            Note.create(req.body.note, function(err, note){
                if(err){
                    console.log(err);
                } else {
                    article.notes.push(note);
                    article.save();
                    res.redirect('/favorites/'+article._id);
                }
            });
        }
    });
});


app.listen(PORT, function(){
    console.log("App running on port " + PORT + "!");
});

