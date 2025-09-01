const fs = require("fs");

function checkUnclosedTags(html, filename) {
  const tags = ["div", "main", "form", "script", "ul", "li", "p", "span"];
  let issues = [];

  tags.forEach(tag => {
    const opens = (html.match(new RegExp(`<${tag}\\b`, "g")) || []).length;
    const closes = (html.match(new RegExp(`</${tag}>`, "g")) || []).length;
    if (opens !== closes) {
      issues.push(`${filename}: <${tag}> opens = ${opens}, closes = ${closes} ❌`);
    }
  });

  return issues;
}

const files = process.argv.slice(2);
if (files.length === 0) {
  console.log("Usage: node checkHtmlTags.js file1.html file2.html ...");
  process.exit(1);
}

files.forEach(file => {
  const html = fs.readFileSync(file, "utf-8");
  const issues = checkUnclosedTags(html, file);
  if (issues.length) {
    console.log(issues.join("\n"));
  } else {
    console.log(`${file}: ✅ No mismatched tags found.`);
  }
});
 //to run use: node checkHtmlTags.js file1.html file2.html ...<more files>
 //example: node checkHtmlTags.js index.html about.html contact.html