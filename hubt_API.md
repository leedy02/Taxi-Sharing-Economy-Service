<!--
**목차**

API
- [Login](#login-api)
- [Sign in](#signin-api)
- [User land](#user_land-api)
- [Destination](#destination-api)
- [Request new taxi](#request_new_taxi-api)
- [Request available taxi](#request_available_taxi-api)
- [Request deny](#request_deny-api)
- [Request not anymore](#request_not_anymore-api)
- [Request accept](#request_accept-api)

---
-->

# HubT API
HTTP로 통신한다.
- Server URL : http://

<br/>

<a name ="login-api"></a>
# Login
login한 정보를 넘겨주며 token을 생성한다.

```http
POST /auth/login
Content-Type : application/json
```

JSON file example
```
{
    id : 'user',
    pw : '1q2w3e4r12'
}
```

### Request

| Parameter | Description |
| --------- | ----------- |
| `id` | 사용자의 아이디 |
| `password` | 사용자의 비밀번호 |

### Response

| Status Code | 설명 |
| ----------- | ---- |
| 200 OK | 성공 |
| 400 Bad Request | `id` 또는 `password`의 누락, 잘못 입력 |

Response body example
```
{
    token : '1bfa9740fec091c571ab7104c'
}
```

| Name | Type | Description |
| ---- | ---- | ----------- |
| `token` | string | Token |

---

<a name = "signin-api"></a>
# Sign in
작성된 회원가입 정보를 넘겨준다.

```http
POST /auth/signin
Content-Type : application/json
```

JSON file example
```
{
     user_info : {
          id : 'user',
          pw : 'pw'
     },
     profile : {
          age : 25,
          sex : 'M',
          card : '0000-0000-0000-0000'
     },
     pref : {
          sex : 'M',
          age_min : 10,
          age_max : 20
     }
}
```

### Response

| Status Code | 설명 |
| ----------- | ---- |
| 200 OK | 회원가입 성공 |
| 400 Bad Request | `id` 중복  |

---

<a name = "destination-api"></a>
# User land
현재 사용자의 위치를 반환하고 변화가 있으면 수정한다.

```http
PUT /user/land
Token : {token}
Content-Type : application/json
```

JSON file example
```
{
     land : 13
}
```

### Request

| Parameter | Description |
| --------- | ----------- |
| `land` | 사용자의 `land_id` |

### Response

| Status Code | 설명 |
| ----------- | ---- |
| 200 OK | `land_id`값 입력 성공 |
| 401 Unauthorized | 잘못된 token 값 |

---

<a name = "destination-api"></a>
# Destination
사용자가 입력한 출발지, 목적지를 각각 위도, 경도로 만들어 JSON 형태로 만든다.

```http
POST /user/destination
Token : {token}
Content-Type : application/json
```

JSON file example
```
{
    depar : {
        x : 128.715367, 
        y : 37.713244, 
    }
    dest : {
        x : 128.715312, 
        y : 37.713412, 
    }
}
```

### Request

| Parameter | Description |
| --------- | ----------- |
| `dest` | 사용자의 출발지 |
| `depart` | 사용자의 목적지 |

### Response

| Status Code | 설명 |
| ----------- | ---- |
| 200 OK | `dest`, `depart` 입력 성공 |
| 401 Unauthorized | 잘못된 token 값 |

Response body example
```
{
     origin_route : {...},
     origin_cost : 14000
}
```

---

<a name = "request_new_taxi-api"></a>
# Request new taxi
사용자에게 신규 배차를 진행해주며 성공시에 택시에 대한 정보를 넘겨준다.

```http
GET /user/request/new_taxi
Token : {token}
Content-Type : application/json
```

### Response

| Status Code | 설명 |
| ----------- | ---- |
| 200 OK | 신규 배차 성공 |
| 200 OK | 배차 가능 택시 없음 |
| 401 Unauthorized | 잘못된 token 값 |


Response body example
```
{
     taxi: {
          taxi_id : '01사 1234',
          name : '서승석'
          tel : '010-2653-3503',
     }

}
```

---

<a name = "request_available_taxi-api"></a>
# Request available taxi
합승 성공시 사용자에게 택시에 관한 정보와 새로운 경로, 비용을 넘겨준다.

```http
GET /user/request/available_taxi
Token : {token}
Content-Type : application/json
```

### Response

| Status Code | 설명 |
| ----------- | ---- |
| 200 OK | 합승 배차 성공 |
| 200 OK | 배차 가능 택시 없음 |
| 401 Unauthorized | 잘못된 token 값 |


Response body example
```
{
     taxi: {
          taxi_id : '01사 1234',
          name : '서승석'
          tel : '010-2653-3503',
     }
     new_route : {...}
     new_cost : 8400
}
```

---

<a name = "request_deny-api"></a>
# Request deny
성사된 합승요청에 대하여 host가 거절했을 경우 

```http
PUT /user/request/deny
Token : {token}
```

### Response

| Status Code | 설명 |
| ----------- | ---- |
| 200 OK | 합승 거절 성공 |
| 401 Unauthorized | 잘못된 token 값 |

---

<a name = "request_not_anymore-api"></a>
# Request not anymore
host가 더이상 합승 추천을 받지 않을 때

```http
PUT /user/request/not_anymore
Token : {token}
```

### Response

| Status Code | 설명 |
| ----------- | ---- |
| 200 OK | 추가 탐색 거절 |
| 401 Unauthorized | 잘못된 token 값 |


---


<a name = "request_accept-api"></a>
# Request accept
추천된 합승을 host와 guest 모두 승낙하였을 때 둘다 승낙했음을 JSON파일로 넘겨준다.

```http
PUT /user/request/accept
Token : {token}
```

### Response

| Status Code | 설명 |
| ----------- | ---- |
| 200 OK | 합승 승낙 |
| 401 Unauthorized | 잘못된 token 값 |

Response body example
```
{
    both_accepted : 'true'
}
```
