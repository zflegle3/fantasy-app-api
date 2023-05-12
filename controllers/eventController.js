const database = require("../database/databaseActions");
const asyncHandler = require("express-async-handler");
const {loadEvents} = require('../database/dataScraping')

// @desc Read Team Data
// @route POST /events/read/id
// @access Private
exports.event_read_id = asyncHandler(async(req, res) => {
    const {id} = req.body;    
    if (!id) {
        return res.status(401).json({team: null, status: "Error: invalid id, no event found"})
    };

    let eventFound = await database.getEventsById(id);
    if (eventFound) {
        return res.status(200).json({
            event: eventFound,
            status: "event found successfully"
        });
    } else {
        return res.status(400).json({
            event: null,
            status: "unable to find event"
        });
    }
});

// @desc Read Team Data
// @route POST /events/read/name
// @access Private
exports.event_read_name = asyncHandler(async(req, res) => {
    const {name} = req.body;    
    if (!name) {
        return res.status(401).json({team: null, status: "Error: invalid name, no event found"})
    };

    let eventFound = await database.getEventsByName(name);
    if (eventFound) {
        return res.status(200).json({
            event: eventFound,
            status: "event found successfully"
        });
    } else {
        return res.status(400).json({
            event: null,
            status: "unable to find event"
        });
    }
});

// @desc Update all events
// @route POST /events/update/all
// @access Private
exports.event_update_all = asyncHandler(async(req, res) => {
    let updatedEvents = 0;
    let newEvents = 0;
    let errors = [];
    //pull event data from cbs url with cheerio
    let eventData = await loadEvents();
    console.log(eventData.length);
    for (let i=0; i< eventData.length; i++) {
        let eventFound = await database.getEventsByName(eventData[i].name);
        if (eventFound) {
            //update existing event
            let eventUpdated = await database.updateEvent(eventFound.id, eventData[i].name, eventData[i].date_start, eventData[i].date_end, eventData[i].status, eventData[i].location, eventData[i].course, eventData[i].network, eventData[i].defending, eventData[i].purse)
            if (!eventUpdated) {
                errors.push(eventData[i]);
            } else {
                updatedEvents += 1;
            }
        } else {
            //create new event
            let eventCreated = await database.createNewEvent(eventData[i].name, eventData[i].date_start, eventData[i].date_end, eventData[i].status, eventData[i].location, eventData[i].course, eventData[i].network, eventData[i].defending, eventData[i].purse)
            if (!eventCreated) {
                errors.push(eventData[i]);
            } else {
                newEvents += 1;
            }
        };
    };

    res.status(200).json({updates: updatedEvents, added: newEvents, errors: errors});
    // res.status(200).json(eventData);
});


// @desc Read Team Data
// @route POST /events/read/name
// @access Private
exports.event_read_name = asyncHandler(async(req, res) => {
    const {name} = req.body;    
    if (!name) {
        return res.status(401).json({team: null, status: "Error: invalid name, no event found"})
    };

    let eventFound = await database.getEventsByName(name);
    if (eventFound) {
        return res.status(200).json({
            event: eventFound,
            status: "event found successfully"
        });
    } else {
        return res.status(400).json({
            event: null,
            status: "unable to find event"
        });
    }
});

// @desc Update one events
// @route POST /events/update/one
// @access Private
exports.event_update_one = asyncHandler(async(req, res) => {
    const {id, name, date_start, date_end, status, location, course, network, defending, purse} = req.body; 
    let eventUpdated = await database.updateEvent(id, name, date_start, date_end, status, location, course, network, defending, purse)
    let eventFound = await database.getEventsById(id);
    if (eventUpdated) {
        res.status(200).json({event: eventFound});
    } else {
        res.status(400).json({event: null});
    }
});


// @desc Read Team Data
// @route POST /events/read/id
// @access Private
exports.event_read_league = asyncHandler(async(req, res) => {
    const {league_id} = req.body;    
    let eventsFound = await database.getEventsByLeagueId(league_id);
    if (eventsFound) {
        return res.status(200).json({
            events: eventsFound,
            status: "events found successfully"
        });
    } else {
        return res.status(400).json({
            events: null,
            status: "unable to find events"
        });
    }
});
