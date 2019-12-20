export function saveAs(string: string, filename: string) {
    let a = document.createElement("a");
    let data = "text/json;charset=utf-8," + encodeURIComponent(string);
    a.href = "data:" + data;
    a.download = filename;
    a.click();
}
