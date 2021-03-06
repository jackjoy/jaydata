import $data, { $C, Guard, Container, Exception } from '../TypeSystem/index.js';

$data.Class.define('$data.EntityStateManager', null, null,
{
    constructor: function (entityContext) {
        this.entityContext = null;
        this.trackedEntities = [];
        this.init(entityContext);
    },
    init: function (entityContext) {
        this.entityContext = entityContext;
    },
    reset: function () {
        this.trackedEntities = [];
    }
}, null);

export default $data
