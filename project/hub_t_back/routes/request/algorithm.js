const { PythonShell } = require("python-shell");
module.exports.candidates_and_route function(host_id){
  let options = {
    pythonPath : 'C:/Users/TaeYoung/PycharmProjects/hut_t_algorithm/venv/Scripts/python.exe',
    scriptPath: 'C:/Users/TaeYoung/PycharmProjects/hut_t_algorithm',
    args: [host_id],
    mode: 'text',
    pythonOptions: ['-u']
  };
  PythonShell.run('algorithm.py', options, function (err, data) {
    if (err) throw err;
    return data;
  });
};

module.exports