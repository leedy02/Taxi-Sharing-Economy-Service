const dbconfig = require('../../../config/database');
const mysql = require('mysql');
const connection = mysql.createConnection(dbconfig);
const axios = require('axios')
function first_candidate(host_id) {
    var land_num_arr = [];
    var candidate = [];
    var host_origin_route;
    connection.query('SELECT route FROM drive_info WHERE host_id = ' + host_id, (error, rows) => {
        if (error) throw error;
        host_origin_route = rows[0];
    });
    for (var i = 0; i < host_origin_route.features.length; i++) {
        if (host_origin_route.features[i].geometry.type == 'Point') {
            var x = parseFloat(host_origin_route.features[i].geometry.coordinates[0]);
            var y = parseFloat(host_origin_route.features[i].geometry.coordinates[1]);
            x *= 100;
            y *= 100;
            x = parseInt(x);
            y = parseInt(y);
            var land_num = x * 36000 + y;
            if (land_num in land_num_arr) continue;
            land_num_arr.push(land_num);
            connection.query('SELECT id FROM user_land WHERE land_id = ' + land_num, (error, rows) => {
                if (error) throw error;
                for (var i = 0; i < rows.length; i++) {
                    candidate.push(rows[i].id);
                }
            });
        }
    }
    return second_candidate(host_id, candidate);
}

function second_candidate(host_id, prev_candidate) {
    var candidate = [];
    var host_profile;
    var host_prefer;
    var guest_id = prev_candidate[i];
    connection.query('SELECT age, sex FROM user WHERE id = ' + host_id, (error, rows) => {
        if (error) throw error;
        host_profile = rows[0];
    });
    connection.query('SELECT age_min, age_max, sex FROM pref_user WHERE id = ' + host_id, (error, rows) => {
        if (error) throw error;
        host_prefer = rows[0];
    });
    for (var i = 0; i < prev_candidate.length; i++) {
        var guest_profile;
        var guest_prefer;
        connection.query('SELECT age, sex FROM user WHERE id = ' + guest_id, (error, rows) => {
            if (error) throw error;
            guest_profile = rows[0];
        });
        connection.query('SELECT age_min, age_max, sex FROM pref_user WHERE id = ' + guest_id, (error, rows) => {
            if (error) throw error;
            guest_prefer = rows[0];
        });
        if (host_profile.age >= guest_prefer.age_min && host_profile.age <= guest_prefer.age_max
            && guest_profile.age >= host_prefer.age_min && guset_profile.age <= host_prefer.age_max
            && (host_profile.sex == guest_prefer.sex || guest_prefer.sex == 'O')
            && (guest_profile.sex == host_prefer.sex || host_prefer.sex == 'O')) {
            candidate.push(prev_candidate[i]);
        }
    }
    return third_candidate1(host_id, candidate);
    //return third_candidate2(host_id, candidate, host_origin_route);
    //return third_candidate3(host_id, candidate, host_origin_route);
}

function measure(start, end) {
    const R = 6378.137; // Radius of earth in KM
    var dLat = end[1] * Math.PI / 180 - start[1] * Math.PI / 180;
    var dLon = end[0] * Math.PI / 180 - start[0] * Math.PI / 180;
    var a = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
        Math.cos(start[1] * Math.PI / 180) * Math.cos(end[1] * Math.PI / 180) *
        Math.sin(dLon / 2) * Math.sin(dLon / 2);
    var c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    var d = R * c;
    return d * 1000; // meters
}

function third_candidate1(host_id, prev_candidate) {
    var candidate = [];
    var host_loc;
    var host_dest;
    var host_total_dist;
    var host_cost;
    connection.query('SELECT dest,cur_loc, total_dist, cost FROM drive_info WHERE id = ' + host_id, (error, rows) => {
        if (error) throw error;
        host_dest = rows[0].dest;
        host_loc = rows[0].cur_loc;
        host_total_dist = rows[0].total_dist;
        host_cost = rows[0].cost;
    });
    for (var i = 0; i < prev_candidate.length; i++) {
        var guest_id = prev_candidate[i];
        var guest_depar;
        var guest_dest;
        var guest_total_dist;
        var guest_cost;
        connection.query('SELECT depar, dest, total_dist, cost FROM destination WHERE id = ' + guest_id, (error, rows) => {
            if (error) throw error;
            guest_depar = rows[0].depar;
            guest_dest = rows[0].dest;
            guest_total_dist = rows[0].total_dist;
            guest_cost = rows[0].cost;
        });
        if (measure(host_loc, guest_depar) + measure(guest_dest, host_dset) +
            Math.min(measure(guest_depar, host_dest), measure(guest_depar, guest_dest)) <=
            (host_total_dist + guest_total_dist) * 0.7) {
            candidate.push([guest_id, guest_depar, guest_total_dist, guest_cost]);
        }
    }
    return final_candidate(host_id, host_loc, host_dest, host_cost, candidate);
}

function final_candidate(host_id, host_loc, host_desthost_cost, prev_candidate) {
    var final_route;
    var rate = 1.0;
    var guest_id;
    var new_route;
    for (var i = 0; i < prev_candidate.length; i++) {
        //api로 모든 경로 탐색
        axios({
            method: 'post',
            headers: {
                "appKey": "l7xx4a5a83a6d55042c1a42f4731cc66801f",
            },
            url: 'https://apis.openapi.sk.com/tmap/routes?version=1&format=json&callback=result',
            async: false,
            data: {
                "startX": host_loc[0],
                "startY": host_loc[1],
                "endX": host_dest[0],
                "endY": host_dest[1],
                "reqCoordType": "WGS84GEO",
                "resCoordType": "WGS84GEO",
                "searchOption": "0",
                "trafficInfo": "N",
                "passList": "" + guest_depar[0] + "," + guest_depar[1] + "," + guest_dest[0] + "," + guestdest[1]
            }
        })
            .then(function (response) {
                new_route = response;
            });
        axios({
            method: 'post',
            headers: {
                "appKey": app_key,
            },
            url: 'https://apis.openapi.sk.com/tmap/routes?version=1&format=json&callback=result',
            async: false,
            data: {
                "startX": host_loc[0],
                "startY": host_loc[1],
                "endX": host_dest[0],
                "endY": host_dest[1],
                "reqCoordType": "WGS84GEO",
                "resCoordType": "WGS84GEO",
                "searchOption": "0",
                "trafficInfo": "N",
                "passList": "" + guest_depar[0] + "," + guest_depar[1] + "," + guest_dest[0] + "," + guestdest[1]
            }
        })
            .then(function (response) {
                new_route = response.data;
            });
        axios({
            method: 'post',
            headers: {
                "appKey": app_key,
            },
            url: 'https://apis.openapi.sk.com/tmap/routes?version=1&format=json&callback=result',
            async: false,
            data: {
                "startX": host_loc[0],
                "startY": host_loc[1],
                "endX": guest_dest[0],
                "endY": guest_dest[1],
                "reqCoordType": "WGS84GEO",
                "resCoordType": "WGS84GEO",
                "searchOption": "0",
                "trafficInfo": "N",
                "passList": "" + host_depar[0] + "," + host_depar[1] + "," + host_dest[0] + "," + host_dest[1]
            }
        })
            .then(function (response) {
                var tmp = response.data;
                if (tmp.features[0].properties.taxiFare < new_route.features[0].properties.taxiFare)
                    new_route = tmp;
            });
        //현재 찾은 경로의 할인율 rate보다 작다면 final_route와 rate를 현재 경로 값으로 갱신.
        if (new_route.features[0].properties.totalFare / (host_cost + prev_candidate[i][3]) <= rate) {
            final_route = new_route;
            rate = new_route.features[0].properties.totalFare / (host_cost + prev_candidate[i][3]);
            guest_id = prev_candidate[i][0];
        }
    }
    return [final_route, guest_id, rate];
}