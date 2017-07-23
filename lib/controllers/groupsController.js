const Grouper = require("../grouper");

class GroupsController {
    create(request, response) {
        const initSettings = request.body;
        const grouper = new Grouper(initSettings);

        response.json(grouper.group());
    }
}

module.exports = GroupsController;