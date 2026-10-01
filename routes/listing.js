const express = require("express");
const router = express.Router();

const wrapAsync = require("../utils/wrapAsync.js");
const Listing = require("../models/listing.js");
const Review = require("../models/review.js");

const {
    isLoggedIn,
    isOwner,
    validateListing
} = require("../middleware.js");

const listingController = require("../controllers/listing.js");

const multer = require("multer");
const {storage} =require("../cloudConfig.js");
const upload = multer({ storage});


// ===============================
// INDEX + CREATE LISTING ROUTES
// ===============================

router.route("/")
    .get(
        wrapAsync(listingController.index)
    )
    .post(
        isLoggedIn,
        upload.single("listing[image][url]"),
        validateListing,
        wrapAsync(listingController.createListing)
    );
    


// ===============================
// NEW LISTING FORM
// ===============================

router.get(
    "/new",
    isLoggedIn,
    listingController.renderNewForm
);


// ===============================
// SHOW / UPDATE / DELETE LISTING
// ===============================

router.route("/:id")
    .get(
        wrapAsync(listingController.showListing)
    )
    .put(
        isLoggedIn,
        isOwner,
        upload.single("listing[image][url]"),
        validateListing,
        wrapAsync(listingController.updateListing)
    )
    .delete(
        isLoggedIn,
        isOwner,
        wrapAsync(listingController.destroyListing)
    );


// ===============================
// EDIT LISTING FORM
// ===============================

router.get(
    "/:id/edit",
    isLoggedIn,
    isOwner,
    wrapAsync(listingController.renderEditForm)
);


// ===============================
// DELETE REVIEW
// ===============================

router.delete(
    "/:id/reviews/:reviewID",
    isLoggedIn,
    wrapAsync(async (req, res) => {

        const { id, reviewID } = req.params;

        // Remove review ID from Listing
        const listing = await Listing.findByIdAndUpdate(
            id,
            {
                $pull: {
                    reviews: reviewID
                }
            },
            {
                new: true
            }
        );

        // Delete review document
        const deletedReview = await Review.findByIdAndDelete(reviewID);

        req.flash("success", "Review Deleted!");

        console.log("Listing:", listing);
        console.log("Deleted Review:", deletedReview);

        res.redirect(`/listings/${id}`);
    })
);


module.exports = router;