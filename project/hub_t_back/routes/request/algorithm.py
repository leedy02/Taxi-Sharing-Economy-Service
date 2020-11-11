import dbconfig
import requests
import t_config
import math
import json
import sys
import math
from scipy.spatial import distance
conn = dbconfig.sql_controller()
t_api = t_config.tmap_api()


def measure(s,e):
    return distance.euclidean((s[0],s[1]),(e[0],e[1]),5)


def xy_to_land(xy):
    x = int(xy[0]*100)
    y = int(xy[1]*100)
    return x*36000+y


def dist(a):
    return math.sqrt(a[0]*a[0]+a[1]*a[1])


def ip1(a, b):
    return a[0]*b[0] + a[1]*b[1]


def ip2(a, b):
    return dist(a) * dist(b)


def first_candidate(host_id):
    land_num_arr = []
    first_candidate_arr = []
    host_route = conn.select_route(id=host_id)
    host_route = json.loads(host_route[0][0])
    for i in host_route['features']:
        if(i['geometry']['type'] != 'Point'):
            continue
        land_num = xy_to_land(i['geometry']['coordinates'])
        if(land_num in land_num_arr):
            continue
        else:
            land_num_arr.append(land_num)
    candidate = conn.select_land(land_num_arr=land_num_arr)
    for i in candidate:
        first_candidate_arr.append(i[0])
    print(first_candidate_arr)
    second_candidate(host_id, first_candidate_arr)


def chk_pref(a_prof, a_pref, b_prof, b_pref):
    return a_pref[0] <= b_prof[0] <= a_pref[1] and b_pref[0] <= a_prof[0] <= b_pref[1] and (a_pref[2] == 'O' or a_pref[2] == b_prof[1]) and (b_pref[2] == 'O' or b_pref[2] == a_prof[1])


def second_candidate(host_id, candidate_arr):
    second_candidate_arr = []
    host_prefer = conn.select_prefer([host_id,host_id])[0]
    host_profile = conn.select_profile([host_id,host_id])[0]
    guest_prefer = conn.select_prefer(candidate_arr)
    guest_profile = conn.select_profile(candidate_arr)
    for i in range(len(candidate_arr)):
        if chk_pref(host_profile, host_prefer, guest_profile[i], guest_prefer[i]) == True:
            second_candidate_arr.append(candidate_arr[i])
    print(second_candidate_arr)
    third_candidate_2(host_id,second_candidate_arr)


def third_candidate_1(host_id, candidate_arr):
    third_candidate_arr = []
    host_d = conn.select_d_from_drive_info(host_id)[0]
    host_s = [host_d[0],host_d[1]]
    host_e = [host_d[2],host_d[3]]
    host_dist = measure(host_s,host_e)
    guest_d = conn.select_d(candidate_arr)
    mn = 1000
    for i in range(len(guest_d)):
        guest_s = [guest_d[i][0],guest_d[i][1]]
        guest_e = [guest_d[i][2], guest_d[i][3]]
        guest_dist = measure(guest_s,guest_e)
        dist_sum = measure(host_s, guest_s) + measure(host_e, guest_e) + min(measure(guest_s, host_e), measure(guest_s, guest_e))
        if dist_sum <= 0.8*(host_dist+guest_dist):
            mn = min(mn,dist_sum/(host_dist+guest_dist))
            third_candidate_arr.append(candidate_arr[i])
    last_candidate(host_id,third_candidate_arr)


def third_candidate_2(host_id, candidate_arr):
    third_candidate_arr = []
    host_d = conn.select_d_from_drive_info(host_id)[0]
    host_s = [host_d[0], host_d[1]]
    host_e = [host_d[2], host_d[3]]
    host_v = [host_e[0] - host_s[0], host_e[1] - host_s[1]]
    guest_d = conn.select_d(candidate_arr)
    for i in range(len(guest_d)):
        guest_s = [guest_d[i][0], guest_d[i][1]]
        guest_e = [guest_d[i][2], guest_d[i][3]]
        guest_v = [guest_e[0] - guest_s[0], guest_e[1] - guest_s[1]]
        if ip1(host_v,guest_v)/ip2(host_v,guest_v) > math.sqrt(2)/2:
            third_candidate_arr.append(candidate_arr[i])
    last_candidate(host_id, third_candidate_arr)

def last_candidate(host_id, candidate_arr):
    host_route = json.loads(conn.select_route(host_id)[0][0])
    host_cost = host_route['features'][0]['properties']['taxiFare']
    host_d = conn.select_d_from_drive_info(host_id)[0]
    min_cost_rate = 10.0
    min_cost = 0
    min_guest_cost = 0
    last_candidate = '0'
    id_route = []
    for i in range(len(candidate_arr)):
        guest_d = conn.select_d(candidate_arr[i])[0]
        guest_route = json.loads(conn.select_route_from_destination(candidate_arr[i])[0][0])
        guest_cost = guest_route['features'][0]['properties']['taxiFare']
        bypass_route = t_api.bypass_route(host_d[0], host_d[1], guest_d[2], guest_d[3], guest_d[0],guest_d[1], host_d[2], host_d[3])
        bypass_route_2 = t_api.bypass_route(host_d[0], host_d[1], host_d[2], host_d[3], guest_d[0],guest_d[1], guest_d[2], guest_d[3])
        if bypass_route['features'][0]['properties']['taxiFare'] > bypass_route_2['features'][0]['properties']['taxiFare']:
            bypass_route = bypass_route_2
        bypass_cost = bypass_route['features'][0]['properties']['taxiFare']
        if bypass_cost / (host_cost+guest_cost) < min_cost_rate:
            min_cost_rate = bypass_cost / (host_cost+guest_cost)
            last_candidate = candidate_arr[i]
            min_cost = bypass_cost
            min_guest_cost = guest_cost
            #print(bypass_cost,min_cost_rate)
        id_route.append([candidate_arr[i],json.dumps(bypass_route)])
    #print(min_cost_rate)
    print(id_route)
    return last_candidate

first_candidate(sys.argv[1])
#print(first_candidate('2489'))

