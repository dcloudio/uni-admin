<template>
  <div :id="idName" @click="generate">
    <slot> Download {{ name }} </slot>
  </div>
</template>

<script setup>
  import download from './download';
  import { computed, useAttrs } from 'vue';
  const attrs = useAttrs();
  defineOptions({
    name: 'downloadExcel',
  });
  const props = defineProps({
    // mime type [xls, csv]
    type: {
      type: String,
      default: 'xls',
    },
    // Json to download
    data: {
      type: Array,
      required: false,
      default: null,
    },
    // fields inside the Json Object that you want to export
    // if no given, all the properties in the Json are exported
    fields: {
      type: Object,
      default: () => null,
    },
    // this prop is used to fix the problem with other components that use the
    // variable fields, like vee-validate. exportFields works exactly like fields
    exportFields: {
      type: Object,
      default: () => null,
    },
    // Use as fallback when the row has no field values
    defaultValue: {
      type: String,
      required: false,
      default: '',
    },
    // Title(s) for the data, could be a string or an array of strings (multiple titles)
    header: {
      default: null,
    },
    // Footer(s) for the data, could be a string or an array of strings (multiple footers)
    footer: {
      default: null,
    },
    // filename to export
    name: {
      type: String,
      default: 'data.xls',
    },
    fetch: {
      type: Function,
    },
    meta: {
      type: Array,
      default: () => [],
    },
    worksheet: {
      type: String,
      default: 'Sheet1',
    },
    //event before generate was called
    beforeGenerate: {
      type: Function,
    },
    //event before download pops up
    beforeFinish: {
      type: Function,
    },
    // Determine if CSV Data should be escaped
    escapeCsv: {
      type: Boolean,
      default: true,
    },
    // long number stringify
    stringifyLongNum: {
      type: Boolean,
      default: false,
    },
  });
  const idNameComputed = computed(() => {
    let now = new Date().getTime();
    return 'export_' + now;
  });
  const idName = idNameComputed;
  const downloadFieldsComputed = computed(() => {
    if (props.fields) return props.fields;
    if (props.exportFields) return props.exportFields;
  });
  const downloadFields = downloadFieldsComputed;
  const generateAction = async () => {
    if (typeof props.beforeGenerate === 'function') {
      await props.beforeGenerate();
    }
    let data = props.data;
    if (typeof props.fetch === 'function' || !data) data = await props.fetch();
    if (!data || !data.length) {
      return;
    }
    let json = getProcessedJsonAction(data, downloadFieldsComputed.value);
    if (props.type === 'html') {
      // this is mainly for testing
      return exportMethodAction(jsonToXLSAction(json), props.name.replace('.xls', '.html'), 'text/html');
    } else if (props.type === 'csv') {
      return exportMethodAction(jsonToCSVAction(json), props.name.replace('.xls', '.csv'), 'application/csv');
    }
    return exportMethodAction(jsonToXLSAction(json), props.name, 'application/vnd.ms-excel');
  };
  const generate = generateAction;
  const exportMethodAction = async (data, filename, mime) => {
    let blob = base64ToBlobAction(data, mime);
    if (typeof props.beforeFinish === 'function') await props.beforeFinish();
    download(blob, filename, mime);
  };
  const exportMethod = exportMethodAction;
  const jsonToXLSAction = (data) => {
    let xlsTemp =
      '<html xmlns:o="urn:schemas-microsoft-com:office:office" xmlns:x="urn:schemas-microsoft-com:office:excel" xmlns="http://www.w3.org/TR/REC-html40"><head><meta name=ProgId content=Excel.Sheet> <meta name=Generator content="Microsoft Excel 11"><meta http-equiv="Content-Type" content="text/html; charset=UTF-8"><!--[if gte mso 9]><xml><x:ExcelWorkbook><x:ExcelWorksheets><x:ExcelWorksheet><x:Name>${worksheet}</x:Name><x:WorksheetOptions><x:DisplayGridlines/></x:WorksheetOptions></x:ExcelWorksheet></x:ExcelWorksheets></x:ExcelWorkbook></xml><![endif]--><style>br {mso-data-placement: same-cell;}</style></head><body><table>${table}</table></body></html>';
    let xlsData = '<thead>';
    const colspan = Object.keys(data[0]).length;
    //Header
    //Header
    const header = props.header || attrs.title;
    if (header) {
      xlsData += parseExtraDataAction(header, '<tr><th colspan="' + colspan + '">${data}</th></tr>');
    }

    //Fields
    //Fields
    xlsData += '<tr>';
    for (let key in data[0]) {
      xlsData += '<th>' + key + '</th>';
    }
    xlsData += '</tr>';
    xlsData += '</thead>';

    //Data
    //Data
    xlsData += '<tbody>';
    data.map((item, index) => {
      xlsData += '<tr>';
      for (let key in item) {
        xlsData += '<td>' + preprocessLongNumAction(valueReformattedForMultilinesAction(item[key])) + '</td>';
      }
      xlsData += '</tr>';
    });
    xlsData += '</tbody>';

    //Footer
    //Footer
    if (props.footer != null) {
      xlsData += '<tfoot>';
      xlsData += parseExtraDataAction(props.footer, '<tr><td colspan="' + colspan + '">${data}</td></tr>');
      xlsData += '</tfoot>';
    }
    return xlsTemp.replace('${table}', xlsData).replace('${worksheet}', props.worksheet);
  };
  const jsonToXLS = jsonToXLSAction;
  const jsonToCSVAction = (data) => {
    let csvData = [];

    //Header
    //Header
    const header = props.header || attrs.title;
    if (header) {
      csvData.push(parseExtraDataAction(header, '${data}\r\n'));
    }

    //Fields
    //Fields
    for (let key in data[0]) {
      csvData.push(key);
      csvData.push(',');
    }
    csvData.pop();
    csvData.push('\r\n');
    //Data
    //Data
    data.map((item) => {
      for (let key in item) {
        let escapedCSV = item[key] + '';
        // Escaped CSV data to string to avoid problems with numbers or other types of values
        // this is controlled by the prop escapeCsv
        if (props.escapeCsv) {
          escapedCSV = '="' + escapedCSV + '"'; // cast Numbers to string
          if (escapedCSV.match(/[,"\n]/)) {
            escapedCSV = '"' + escapedCSV.replace(/\"/g, '""') + '"';
          }
        }
        csvData.push(escapedCSV);
        csvData.push(',');
      }
      csvData.pop();
      csvData.push('\r\n');
    });
    //Footer
    //Footer
    if (props.footer != null) {
      csvData.push(parseExtraDataAction(props.footer, '${data}\r\n'));
    }
    return csvData.join('');
  };
  const jsonToCSV = jsonToCSVAction;
  const getProcessedJsonAction = (data, header) => {
    let keys = getKeysAction(data, header);
    let newData = [];
    data.map((item, index) => {
      let newItem = {};
      for (let label in keys) {
        let property = keys[label];
        newItem[label] = getValueAction(property, item);
      }
      newData.push(newItem);
    });
    return newData;
  };
  const getProcessedJson = getProcessedJsonAction;
  const getKeysAction = (data, header) => {
    if (header) {
      return header;
    }
    let keys = {};
    for (let key in data[0]) {
      keys[key] = key;
    }
    return keys;
  };
  const getKeys = getKeysAction;
  const parseExtraDataAction = (extraData, format) => {
    let parseData = '';
    if (Array.isArray(extraData)) {
      for (let i = 0; i < extraData.length; i++) {
        if (extraData[i]) parseData += format.replace('${data}', extraData[i]);
      }
    } else {
      parseData += format.replace('${data}', extraData);
    }
    return parseData;
  };
  const parseExtraData = parseExtraDataAction;
  const getValueAction = (key, item) => {
    const field = typeof key !== 'object' ? key : key.field;
    let indexes = typeof field !== 'string' ? [] : field.split('.');
    let value = props.defaultValue;
    if (!field) value = item;
    else if (indexes.length > 1) value = getValueFromNestedItemAction(item, indexes);
    else value = parseValueAction(item[field]);
    if (key.hasOwnProperty('callback')) value = getValueFromCallbackAction(value, key.callback);
    return value;
  };
  const getValue = getValueAction;
  const valueReformattedForMultilinesAction = (value) => {
    if (typeof value == 'string') return value.replace(/\n/gi, '<br/>');
    else return value;
  };
  const valueReformattedForMultilines = valueReformattedForMultilinesAction;
  const preprocessLongNumAction = (value) => {
    if (props.stringifyLongNum) {
      if (String(value).startsWith('0x')) {
        return value;
      }
      if (!isNaN(value) && value != '') {
        if (value > 99999999999 || value < 0.0000000000001) {
          return '="' + value + '"';
        }
      }
    }
    return value;
  };
  const preprocessLongNum = preprocessLongNumAction;
  const getValueFromNestedItemAction = (item, indexes) => {
    let nestedItem = item;
    for (let index of indexes) {
      if (nestedItem) nestedItem = nestedItem[index];
    }
    return parseValueAction(nestedItem);
  };
  const getValueFromNestedItem = getValueFromNestedItemAction;
  const getValueFromCallbackAction = (item, callback) => {
    if (typeof callback !== 'function') return props.defaultValue;
    const value = callback(item);
    return parseValueAction(value);
  };
  const getValueFromCallback = getValueFromCallbackAction;
  const parseValueAction = (value) => {
    return value || value === 0 || typeof value === 'boolean' ? value : props.defaultValue;
  };
  const parseValue = parseValueAction;
  const base64ToBlobAction = (data, mime) => {
    let base64 = window.btoa(window.unescape(encodeURIComponent(data)));
    let bstr = atob(base64);
    let n = bstr.length;
    let u8arr = new Uint8ClampedArray(n);
    while (n--) {
      u8arr[n] = bstr.charCodeAt(n);
    }
    return new Blob([u8arr], {
      type: mime,
    });
  };
  const base64ToBlob = base64ToBlobAction;
</script>
