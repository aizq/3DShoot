const packageJSON = require('../package.json');

exports.template = `
<div class="container">
    <ui-label value="i18n:${packageJSON.name}.title"></ui-label>
</div>
`;

exports.style = `
.container {
    margin-top: 10px;
    margin-bottom: 5px;
    text-align: center;
    border: dashed 1px #6b6b6b;
    border-radius: 4px;
}
`;

exports.update = function(dump) {
    dump.value.visibility.tooltip = 'i18n:camera.visibility';
};