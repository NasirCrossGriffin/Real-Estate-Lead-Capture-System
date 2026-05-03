const express = require('express');
const router = express.Router();
const RealEstateQuery = require('../models/real-estate-query');
const RealEstatePhoto = require("../models/real-estate-photo");


// CREATE
router.post('/', async (req, res) => {
  try {
    const doc = await RealEstateQuery.create(req.body);

    const populated = await RealEstateQuery.findById(doc._id)
      .populate('organization')
      .populate('user');

    return res.status(201).json(populated);
  } catch (err) {
    return res.status(400).json({ error: err.message });
  }
});

// READ ALL
// Optional filters:
// ?organization=<id>
// ?user=<id>
// ?service=buy
// ?facingForeclosure=true
// ?city=Philadelphia
// ?state=PA
router.get('/', async (req, res) => {
  try {
    const filter = {};

    if (req.query.organization) filter.organization = req.query.organization;
    if (req.query.user) filter.user = req.query.user;
    if (req.query.service) filter.service = req.query.service;
    if (req.query.city) filter.city = req.query.city;
    if (req.query.state) filter.state = req.query.state;

    if (req.query.facingForeclosure !== undefined) {
      filter.facingForeclosure = req.query.facingForeclosure === 'true';
    }

    const docs = await RealEstateQuery.find(filter)
      .populate('organization')
      .populate('user')
      .sort({ createdAt: -1 });

    return res.status(200).json(docs);
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
});

// READ ALL BY ORGANIZATION
router.get('/organization/:organizationId', async (req, res) => {
  try {
    const docs = await RealEstateQuery.find({
      organization: req.params.organizationId,
    })
      .populate('organization')
      .populate('user')
      .sort({ createdAt: -1 });

    return res.status(200).json(docs);
  } catch (err) {
    return res.status(400).json({ error: err.message });
  }
});

// READ ALL BY USER
router.get('/user/:userId', async (req, res) => {
  try {
    const docs = await RealEstateQuery.find({
      user: req.params.userId,
    })
      .populate('organization')
      .populate('user')
      .sort({ createdAt: -1 });

    return res.status(200).json(docs);
  } catch (err) {
    return res.status(400).json({ error: err.message });
  }
});

// READ ONE
router.get('/:id', async (req, res) => {
  try {
    const doc = await RealEstateQuery.findById(req.params.id)
      .populate('organization')
      .populate('user');

    if (!doc) {
      return res.status(404).json({ error: 'RealEstateQuery not found' });
    }

    return res.status(200).json(doc);
  } catch (err) {
    return res.status(400).json({ error: err.message });
  }
});

// UPDATE
router.put('/:id', async (req, res) => {
  try {
    const doc = await RealEstateQuery.findByIdAndUpdate(
      req.params.id,
      req.body,
      {
        new: true,
        runValidators: true,
      }
    )
      .populate('organization')
      .populate('user');

    if (!doc) {
      return res.status(404).json({ error: 'RealEstateQuery not found' });
    }

    return res.status(200).json(doc);
  } catch (err) {
    return res.status(400).json({ error: err.message });
  }
});

// DELETE
router.delete('/:id', async (req, res) => {
  try {
    const doc = await RealEstateQuery.findByIdAndDelete(req.params.id);

    if (!doc) {
      return res.status(404).json({ error: 'RealEstateQuery not found' });
    }

    return res.status(200).json({ deleted: true, id: req.params.id });
  } catch (err) {
    return res.status(400).json({ error: err.message });
  }
});

// GET /api/real-estate-query/organization/:organizationId/filtered
router.get("/organization/:organizationId/filtered", async (req, res) => {
  try {
    const { organizationId } = req.params;

    const {
      inForeclosureOnly,
      withPhotosOnly,
      sortByFollowUpDate,
      sortByStatus,
      showUnviewedOnly,
    } = req.query;

    const filters = {
      organization: organizationId,
    };

    if (inForeclosureOnly === "true") {
      filters.facingForeclosure = true;
    }

    if (showUnviewedOnly === "true") {
      filters.viewed = false;
    }

    let queries = await RealEstateQuery.find(filters)
      .populate("user")
      .sort({ createdAt: -1 });

    // Special photo filtering
    if (withPhotosOnly === "true") {
      const queryIds = queries.map((q) => q._id);

      const photos = await RealEstatePhoto.find({
        realEstateQuery: { $in: queryIds },
      }).select("realEstateQuery");

      const queryIdsWithPhotos = new Set(
        photos.map((photo) => photo.realEstateQuery.toString())
      );

      queries = queries.filter((query) =>
        queryIdsWithPhotos.has(query._id.toString())
      );
    }

    // Sort by follow-up date
    if (sortByFollowUpDate === "true") {
      queries.sort((a, b) => {
        const dateA = new Date(a.followUpDate).getTime();
        const dateB = new Date(b.followUpDate).getTime();
        return dateA - dateB;
      });
    }

    // Sort by status
    if (sortByStatus === "true") {
      const statusOrder = {
        new: 1,
        contacted: 2,
        appointment_set: 3,
        offer_made: 4,
        under_contract: 5,
        closed: 6,
        dead: 7,
      };

      queries.sort((a, b) => {
        return statusOrder[a.status] - statusOrder[b.status];
      });
    }

    res.status(200).json(queries);
  } catch (err) {
    console.error(err);
    res.status(500).json({
      message: "Failed to get filtered real estate queries",
      error: err.message,
    });
  }
});

module.exports = router;