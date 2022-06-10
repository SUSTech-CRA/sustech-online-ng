const download = require('download');

const file2download = [
    {
        name: '南方科技大学计算机系创新实践项目汇总',
        url: 'https://raw.githubusercontent.com/SUSTech-OpenSource/innovative_project_SUSTech/main/README.md',
        path: 'docs/study/cse/',
        fileName: 'innovative-project.md'
    }
]

file2download.forEach(element => {
    let url = element.url;
    let path = `${__dirname}/../${element.path}`
    let options = {
        filename: element.fileName
    }

    download(url, path, options)
        .then(() => {
            console.log(`Download Completed -- ${element.name}`);
        })
});
