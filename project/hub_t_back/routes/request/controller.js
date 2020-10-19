module.exports = {
    accept: function (req, res) {
        res.json({ both_accepted: true })
    },
    available_taxi: function (req, res) {
        res.json({
            taxi: {
                num: "01사 1234",
                name: "서승석",
                tel: "010-1234-5678"
            },
            new_route: { route: "" },
            new_cost: 8400
        });
    },
    deny: function (req, res) {
        res.send("NOPE");
    },
    new_taxi: function (req, res) {
        res.json({
            taxi: {
                num: "01사 1234",
                name: "서승석",
                tel: "010-1234-5678"
            }
        });
    },
    not_anymore: function (req, res) {
        res.send("nope");
    }
};