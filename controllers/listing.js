const Listing = require("../models/listing");
const mbxGeocoding = require("@mapbox/mapbox-sdk/services/geocoding");

const mapToken = process.env.MAP_TOKEN;
const geocodingClient = mbxGeocoding({
    accessToken: mapToken
});


// INDEX ROUTE
module.exports.index = async (req, res) => {
    const allListings = await Listing.find({});
    res.render("listings/index.ejs", { allListings });
};


// NEW FORM
module.exports.renderNewForm = (req, res) => {
    res.render("listings/new.ejs");
};


// SHOW LISTING
module.exports.showListing = async (req, res) => {

    let { id } = req.params;

    const listing = await Listing.findById(id)
        .populate({
            path: "reviews",
            populate: {
                path: "author",
            },
        })
        .populate("owner");

    if (!listing) {
        req.flash("error", "Listing you requested for does not exist!");
        return res.redirect("/listings");
    }

    res.render("listings/show.ejs", { listing });
};


// CREATE LISTING
module.exports.createListing = async (req, res) => {

    let response = await geocodingClient.forwardGeocode({
        query: req.body.listing.location,
        limit: 1,
    }).send();

    let url = req.file.path;
    let filename = req.file.filename;

    const newListing = new Listing(req.body.listing);

    // Logged-in user ko owner banana
    newListing.owner = req.user._id;

    // Cloudinary image
    newListing.image = {
        url,
        filename
    };

    // Mapbox geometry
    newListing.geometry = response.body.features[0].geometry;

    let saveListing = await newListing.save();

    console.log(saveListing);

    req.flash("success", "New Listing Created!");

    res.redirect("/listings");
};


// EDIT FORM
module.exports.renderEditForm = async (req, res) => {

    let { id } = req.params;

    const listing = await Listing.findById(id);

    if (!listing) {
        req.flash("error", "Listing you requested for does not exist!");
        return res.redirect("/listings");
    }

    let originalImageUrl = listing.image.url;

    originalImageUrl = originalImageUrl.replace(
        "/upload",
        "/upload/w_250"
    );

    res.render("listings/edit.ejs", {
        listing,
        originalImageUrl
    });
};


// UPDATE LISTING
module.exports.updateListing = async (req, res) => {

    let { id } = req.params;

    let listing = await Listing.findById(id);

    if (!listing) {
        req.flash("error", "Listing does not exist!");
        return res.redirect("/listings");
    }

    // Update listing information
    Object.assign(listing, req.body.listing);

    // Update location and Mapbox geometry
    if (req.body.listing.location) {

        let response = await geocodingClient
            .forwardGeocode({
                query: req.body.listing.location,
                limit: 1
            })
            .send();

        if (
            !response.body.features ||
            response.body.features.length === 0
        ) {
            req.flash("error", "Location not found!");
            return res.redirect(`/listings/${id}/edit`);
        }

        // Save Mapbox geometry
        listing.geometry =
            response.body.features[0].geometry;
    }

    // Update image if new image is uploaded
    if (req.file) {

        listing.image = {
            url: req.file.path,
            filename: req.file.filename
        };
    }

    await listing.save();

    console.log("UPDATED GEOMETRY:", listing.geometry);

    req.flash("success", "Listing Updated!");

    res.redirect(`/listings/${id}`);
};


// DELETE LISTING
module.exports.destroyListing = async (req, res) => {

    let { id } = req.params;

    let deletedListing = await Listing.findByIdAndDelete(id);

    console.log(deletedListing);

    req.flash("success", "Listing Deleted!");

    res.redirect("/listings");
};