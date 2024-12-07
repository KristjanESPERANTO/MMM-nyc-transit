/* MagicMirror²
 * Module: MMM-NYC-transit
 *
 * By Elan Trybuch https://github.com/elaniobro
 * MIT Licensed.
 */
const Log = require('logger')
let NodeHelper = require('node_helper')
let { createClient } = require('mta-realtime-subway-departures')
let fs = require('node:fs')
let mtaStationIds = require('mta-subway-stations')

module.exports = NodeHelper.create({
  start: function () {
    Log.log( this.name + ' helper method started...')
  },

  getDepartures: async function (config) {
    let apiKey = config.apiKey
    let client = createClient(apiKey)
    let self = this
    let stations = config.stations.map((obj) => obj.stationId)
    let stationIds = {}
    let walkingTime = config.stations.map((obj) => obj.walkingTime)
    let dirUpTown = config.stations.map((obj) => obj.dir.upTown)
    let dirDownTown = config.stations.map((obj) => obj.dir.downTown)
    let isList = config.displayType !== 'marquee'

    try {
      const data = await fs.promises.readFile(
        `${__dirname}/node_modules/mta-subway-complexes/complexes.json`,
        'utf8'
      )

      stationIds = JSON.parse(data)
    } catch (error) {
      Log.error("[MMM-nyc-transit]", error)
    }

    client
      .departures(stations)
      .then((responses) => {
        let upTown = []
        let downTown = []

        if (responses.length === undefined) {
          let temp = responses

          responses = []
          responses.push(temp)
        }

        responses.forEach((response, n) => {
          response.lines.forEach((line) => {
            // Southbound Departures
            line.departures.S.forEach((i) => {
              for (let key in mtaStationIds) {
                if (i.destinationStationId === mtaStationIds[key]['Station ID']) {
                  i.destinationStationId = mtaStationIds[key]['Complex ID']
                }
              }

              if (i.destinationStationId !== undefined && dirDownTown[n]) {
                downTown.push({
                  routeId: i.routeId,
                  time: this.getDate(i.time, walkingTime[n]),
                  destination:
                    i.destinationStationId === '281'
                      ? stationIds['606'].name
                      : stationIds[i.destinationStationId].name,
                  walkingTime: walkingTime[n],
                })
              }
            })

            // Nothbound Departures
            line.departures.N.forEach((i) => {
              for (let key in mtaStationIds) {
                if (i.destinationStationId === mtaStationIds[key]['Station ID']) {
                  i.destinationStationId = mtaStationIds[key]['Complex ID']
                }
              }

              if (i.destinationStationId !== undefined && dirUpTown[n]) {
                upTown.push({
                  routeId: i.routeId,
                  time: this.getDate(i.time, walkingTime[n]),
                  destination:
                    i.destinationStationId === '281'
                      ? stationIds['606'].name
                      : stationIds[i.destinationStationId].name,
                  walkingTime: walkingTime[n],
                })
              }
              responses.forEach((response, n) => {
                response.lines.forEach((line) => {
                  // Southbound Departures
                  line.departures.S.forEach((i) => {
                    for (let key in mtaStationIds) {
                      if (i.destinationStationId === mtaStationIds[key]['Station ID']) {
                        i.destinationStationId = mtaStationIds[key]['Complex ID']
                      }
                    }

                    if (i.destinationStationId !== undefined && dirDownTown[n]) {
                      downTown.push({
                        routeId: i.routeId,
                        time: this.getDate(
                          i.time,
                          walkingTime[n]
                        ),
                        destination:
                          i.destinationStationId ==='281'
                            ? stationIds['606'].name
                            : stationIds[
                              i.destinationStationId].name,
                        walkingTime: walkingTime[n],
                      })
                    }
                  })

                  // Nothbound Departures
                  line.departures.N.forEach((i) => {
                    for (let key in mtaStationIds) {
                      if (i.destinationStationId ===mtaStationIds[key]['Station ID']) {
                        i.destinationStationId = mtaStationIds[key]['Complex ID']
                      }
                    }

                    if (i.destinationStationId !== undefined && dirUpTown[n]) {
                      upTown.push({
                        routeId: i.routeId,
                        time: this.getDate(
                          i.time,
                          walkingTime[n]
                        ),
                        destination:
                          i.destinationStationId ==='281'
                            ? stationIds['606'].name
                            : stationIds[i.destinationStationId].name,
                        walkingTime: walkingTime[n],
                      })
                    }
                  })
                })
              })

              if (isList) {
                self.sendSocketNotification('TRAIN_TABLE', {
                  stations: stations,
                  data: [
                    { downTown: downTown.filter((train) => train.time > 0),},
                    { upTown: upTown.filter((train) => train.time > 0),},
                  ]
                })
              } else {
                self.sendSocketNotification('TRAIN_TABLE', {
                  stations: stations,
                  data: [
                    { downTown: downTown.filter((train) => train.time > 0).slice(0, 3),},
                    { upTown: upTown.filter((train) => train.time > 0).slice(0, 3),},
                  ]
                })
              }
            })
          })
        })

        if (isList) {
          self.sendSocketNotification('TRAIN_TABLE', {
            stations: stations,
            data: [
              { downTown: downTown.filter((train) => train.time > 0),},
              { upTown: upTown.filter((train) => train.time > 0) },
            ]
          })
        } else {
          self.sendSocketNotification('TRAIN_TABLE', {
            stations: stations,
            data: [
              { downTown: downTown.filter((train) => train.time > 0).slice(0, 3),},
              { upTown: upTown.filter((train) => train.time > 0).slice(0, 3),}
            ]
          })
        }
      })
      .catch((error) => {
        Log.error("[MMM-nyc-transit]", error)
      })
  },

  getDate: function (time, walkingTime) {
    // time is a unix_timestamp
    let now = Math.round(new Date().getTime() / 1000)
    let secdiff = time - now
    let mindiff = Math.floor(secdiff / 60)

    mindiff = '0' + (mindiff % 60)

    // Will display time in minutes format
    let formattedTime = Number(mindiff.substr(-2))

    return formattedTime - walkingTime
  },

  //Subclass socketNotificationReceived received.
  socketNotificationReceived: function (notification, config) {
    if (notification === 'GET_DEPARTURES') {
      this.getDepartures(config)
    }
  },
})
