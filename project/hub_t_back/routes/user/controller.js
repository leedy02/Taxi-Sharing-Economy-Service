module.exports = {
    destination: function (req, res) {
        res.json({
            depart: {
                x: 156,
                y: 134
            },
            dest: {
                x: 128,
                y: 37
            }
        });
    },
    land: function (req, res) {
        res.json({ land: 13 });
    }
}
