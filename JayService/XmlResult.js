$data.Class.define('$data.ServiceResult', null, null, {
    constructor: function(data){
        this.data = data;
    },
    data: { },
    contentType: { value: 'text/plain' },
    statusCode: { value: 200 },
    toString: function(){
        return this.data.toString();
    },
    getData: function () {
        return this.data;
    }
});

$data.ServiceResult.extend('$data.JavaScriptResult', {
    contentType: { value: 'text/javascript' }
});

$data.ServiceResult.extend('$data.HtmlResult', {
    contentType: { value: 'text/html' }
});

$data.ServiceResult.extend('$data.JSONResult', {
    contentType: { value: 'application/json' },
    toString: function(){
        return JSON.stringify(this.data);
    }
});

$data.ServiceResult.extend('$data.XmlResult', {
    contentType: { value: 'application/xml' },
    toString: function(){
        return this.data.toString();
    }
});

$data.ServiceResult.extend('$data.MultiPartMixedResult', {
    constructor: function(data, boundary){
        this.contentType = this.contentType + '; boundary=' + boundary;
    },
    contentType: { value: 'multipart/mixed' },
    toString: function () {
        return this.data.toString();
    }
});

/*$data.JSONResult.extend('$data.oDataJSONResult', {
    constructor: function(data, builderCfg){
        var builder = new $data.oDataServer.oDataResponseDataBuilder(builderCfg);
        this.data = builder.convertToResponse(data);
    }
});*/

$data.ServiceResult.extend('$data.oDataResult', {
    constructor: function (data, builderCfg) {
        var request = builderCfg.request;
        var acceptHeader = $data.JayService.OData.Utils.getHeaderValue(request.headers, 'Accept');
        var version = builderCfg.version;

        if ((version === 'V3' && acceptHeader.indexOf($data.JayService.OData.Defaults.jsonV3ContentType) >= 0) || (version !== 'V3' && acceptHeader.indexOf($data.JayService.OData.Defaults.jsonContentType) >= 0) ||
            (request.query && this.jsonFormats.indexOf(request.query.$format) >= 0) ||
            //method xml result not implemented
            builderCfg.methodConfig) {
            this.contentType = $data.JayService.OData.Defaults.jsonReturnContentType;
            var builder = new $data.oDataServer.oDataResponseDataBuilder(builderCfg);
            this.data = JSON.stringify(builder.convertToResponse(data));

            if (request.query.$callback) {
                this.data = request.query.$callback + '(' + this.data + ');';
            }

        } else {
            this.contentType = $data.JayService.OData.Defaults.xmlContentType;
            builderCfg.headers = request.headers;
            var transf = new $data.oDataServer.EntityXmlTransform(builderCfg.context, builderCfg.baseUrl, builderCfg);
            this.data = transf.convertToResponse(data, builderCfg.collectionName, builderCfg.selectedFields, builderCfg.includes);
        }
    },
    /*toString: function () {
        return typeof this.data === 'string' ? this.data : JSON.stringify(this.data);
    },*/
    jsonFormats: {
        value: [
            'json',
            'verbose',
            'lightweight'
        ]
    }
});

$data.ServiceResult.extend('$data.oDataSimpleResult', {
    constructor: function (data, memDef) {
        this.fieldDefinition = memDef;

        if (Container.resolveType(this.fieldDefinition.type) === $data.Blob) {
            this.contentType = 'application/octet-stream';
        }

        //TODO: read contentType hint from definition and set it into this.contentType
    },
    toString: function () {
        var typeName = Container.resolveName(this.fieldDefinition.type);
        if (this.converter.fromDb[typeName]) {
            return this.converter.fromDb[typeName](this.data);
        }
        throw "The segment before '$value' must be a primitive property.";
    },
    converter: {
        value: {
            fromDb: {
                '$data.ObjectID': function (o) { return o.toString(); },
                '$data.Integer': function (o) { return o.toString(); },
                '$data.Number': function (o) { return o.toString(); },
                '$data.Date': function (o) { return o instanceof $data.Date ? o.toISOString().replace('Z', '') : o.toString() },
                '$data.String': function (o) { return o.toString(); },
                '$data.Boolean': function (o) { return o.toString(); },
                '$data.Blob': function (o) { return new Buffer(o, 'base64'); },
                '$data.Object': function (o) { return JSON.stringify(o); },
                '$data.Array': function (o) { return JSON.stringify(o); },
                '$data.Guid': function (o) { return o.toString(); },
                '$data.GeographyPoint': function (o) { return JSON.stringify(o); },
                '$data.GeometryPoint': function (o) { return JSON.stringify(o); },
                '$data.GeographyLineString': function (o) { return JSON.stringify(o); },
                '$data.GeographyPolygon': function (o) { return JSON.stringify(o); },
                '$data.GeographyMultiPoint': function (o) { return JSON.stringify(o); },
                '$data.GeographyMultiLineString': function (o) { return JSON.stringify(o); },
                '$data.GeographyMultiPolygon': function (o) { return JSON.stringify(o); },
                '$data.GeographyCollection': function (o) { return JSON.stringify(o); },
                '$data.GeometryLineString': function (o) { return JSON.stringify(o); },
                '$data.GeometryPolygon': function (o) { return JSON.stringify(o); },
                '$data.GeometryMultiPoint': function (o) { return JSON.stringify(o); },
                '$data.GeometryMultiLineString': function (o) { return JSON.stringify(o); },
                '$data.GeometryMultiPolygon': function (o) { return JSON.stringify(o); },
                '$data.GeometryCollection': function (o) { return JSON.stringify(o); }
            }
        }
    }
});

$data.ServiceResult.extend('$data.EmptyServiceResult', {
    constructor: function (statusCode) {
        this.statusCode = statusCode;
    },
    contentType: { value: '' },
    toString: function () {
    }
});
