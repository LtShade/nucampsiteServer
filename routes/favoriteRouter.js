const express = require("express");
const favoriteRouter = express.Router();
const authenticate = require("../authenticate");
const cors = require("./cors");
const Favorite = require("../models/favorite");
const campsiteRouter = require("./campsiteRouter");

favoriteRouter
	.route("/")
	.options(cors.corsWithOptions, (req, res) => res.sendStatus(200))
	.get(cors.cors, authenticate.verifyUser, (req, res, next) => {
		Favorite.find({ user: req.user._id })
			.populate("user")
			.populate("campsites")
			.then((favorites) => {
				res.statusCode = 200;
				res.setHeader("Content-Type", "application/json");
				res.json(favorites);
			})
			.catch((err) => next(err));
	})
	.post(cors.corsWithOptions, authenticate.verifyUser, (req, res) => {
		Favorite.findOne({ user: req.user._id })
			.then((favorite) => {
				if (favorite) {
					req.body.forEach((campsite) => {
						console.log(campsite);

						if (!favorite.campsites.includes(campsite._id)) {
							favorite.campsites.push(campsite._id);
						} else {
							console.log(`Found Duplicate ${campsite._id}`);
						}
					});
					favorite.save().then((favorite) => {
						res.statusCode = 200;
						res.setHeader("Content-Type", "application/json");
						res.json(favorite);
					});
				} else {
					Favorite.create({ user: req.user._id, campsites: req.body }).then(
						(favorite) => {
							console.log("Favorite Created ", favorite);
							res.statusCode = 200;
							res.setHeader("Content-Type", "application/json");
							res.json(favorite);
						}
					);
				}
			})
			.catch((err) => next(err));
	})
	.put(
		cors.corsWithOptions,
		authenticate.verifyUser,

		(req, res, next) => {
			res.statusCode = 403;
			res.end(
				`POST operation not supported on /campsites/${req.params.campsiteId}`
			);
		}
	)
	.delete(cors.corsWithOptions, authenticate.verifyUser, (req, res, next) => {
		Favorite.findOneAndDelete({ user: req.user._id })
			.then((response) => {
				if (response) {
					res.statusCode = 200;
					res.setHeader("Content-Type", "application/json");
					res.json(response);
				} else {
					res.statusCode = 200;
					res.setHeader("Content-Type", "text/plain");
					res.end("You do not have any favorites to delete.");
				}
			})
			.catch((err) => next(err));
	});

favoriteRouter
	.route("/:campsiteId")
	.options(cors.corsWithOptions, (req, res) => res.sendStatus(200))
	.get(cors.cors, (req, res, next) => {
		res.statusCode = 403;
		res.end(
			`POST operation not supported on /campsites/${req.params.campsiteId}`
		);
	})
	.post(cors.corsWithOptions, authenticate.verifyUser, (req, res) => {
		Favorite.findOne({ user: req.user._id }).then((favorite) => {
			if (favorite) {
				if (favorite.campsites.includes(req.params.campsiteId)) {
					console.log(`${req.params.campsiteId} is already a favorite.`);
				} else {
					favorite.campsites.push(req.params.campsiteId);
				}
				favorite.save().then((favorite) => {
					res.statusCode = 200;
					res.setHeader("Content-Type", "application/json");
					res.json(favorite);
				});
			} else {
				Favorite.create({
					user: req.user._id,
					campsites: [req.params.campsiteId],
				}).then((favorite) => {
					console.log("Favorite Created ", favorite);
					res.statusCode = 200;
					res.setHeader("Content-Type", "application/json");
					res.json(favorite);
				});
			}
		});
	})
	.put(cors.corsWithOptions, authenticate.verifyUser, (req, res, next) => {
		res.statusCode = 403;
		res.end(
			`POST operation not supported on /campsites/${req.params.campsiteId}`
		);
	})
	.delete(cors.corsWithOptions, authenticate.verifyUser, (req, res, next) => {
		Favorite.findOne({ user: req.user._id })
			.then((favorite) => {
				favorite.campsites = favorite.campsites.filter((campsite) => {
					return campsite != req.params.campsiteId;
				});
				favorite.save().then((favorite) => {
					res.statusCode = 200;
					res.setHeader("Content-Type", "application/json");
					res.json(favorite);
				});
			})

			.catch((err) => next(err));
	});

module.exports = favoriteRouter;
