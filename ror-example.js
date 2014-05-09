BlogPost = new Meteor.Collection('blogpost');
Comments = new Meteor.Collection('comments');

(function () {
    var commentCursor;
    if (Meteor.isClient) {
        Meteor.subscribe('all');

        Template.blog.post = function() {
            var post = BlogPost.rorFindOne();
            return post;
        };

        Template.blog.postHasChanged = function() {
            return BlogPost.rorHasChanged();
        };

        Template.blog.comment = function() {
            commentCursor = Comments.rorFind({}, { 'sort' : { 'created' : -1 } });
            return commentCursor;
        };

        Template.blog.longAgo = function () {
            return moment(this.created).fromNow();
        };

        Template.blog.commentsCollection = function () {
            return Comments;
        };

        Template.blog.postCollection = function () {
          return BlogPost;
        };

        Template.blog.commentPhrase = function() {
            if (this.difference > 0) {
              return this.difference + ' comments have been added';
            } else if (this.difference < 0) {
                return -this.difference + ' comments have been removed';
            }

            return 'Comments have been changed';
        };

        Template.blog.events({
            'submit .reply.form' : function (e) {
                Comments.insert({
                    'name': 'Anonymous',
                    'content': $('.comment-textarea').val(),
                    'created' : new Date()
                });

                $('.comment-textarea').val('');
                ReactiveOnRequest.trigger(commentCursor);

                e.preventDefault();
            }
        });
    }

    if (Meteor.isServer) {
        Meteor.publish('all', function() {
            return [Comments.find(), BlogPost.find()];
        });

        Meteor.startup(function() {
            var accounts = ['Peter', 'Heidi', 'Anna', 'Hans Peter'],
              content = [
              "I like this", "Why do I exist?", "Je ne peux pas parler anglais",
              "This blog post doesn't have any real message", "I don't feel this",
              "I absolutely love this blog post, bravo!"
            ];

            // Get some changes going
            Meteor.setInterval(function() {
                var post;

                Comments.insert({
                    'name': Random.choice(accounts),
                    'content': Random.choice(content),
                    'created' : new Date()
                });

                if (Comments.find().count() >= 15) {
                    Comments.remove({});

                    BlogPost.update({
                        'title': 'My Blog Post'
                    }, {
                        $set: {
                            'likes': 1,
                            'text' : 'lorem ipsum dolor set amet'
                        }
                    });
                }
            }, 3200);

            Meteor.setInterval(function() {
                var post = BlogPost.findOne({ 'title': 'My Blog Post' });

                BlogPost.update({
                    'title': 'My Blog Post'
                }, {
                    $inc: {
                        'likes': 7
                    },
                    $set : {
                        'text' : 'text ' + post.text + ' additional content'
                    }
                });
            }, 8000);

            BlogPost.remove({});
            BlogPost.insert({
                'title': 'My Blog Post',
                'text': 'lorem ipsum dolor set amet',
                'likes': 5,
                'created' : new Date(),
                'createdAt' : moment(this.created).format('Do of MMMM YYYY, h:mm:ss a')
            });
        });
    }
    
}())
