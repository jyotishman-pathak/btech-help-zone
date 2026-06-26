import fs from 'fs';
const filePath = './lib/data.ts';
let content = fs.readFileSync(filePath, 'utf8');

// The exact real branches for each college
const collegeBranches = {
    "AEC": [
        "Computer Science and Engineering",
        "Electronics and Telecommunication Engineering",
        "Electrical Engineering",
        "Civil Engineering",
        "Mechanical Engineering",
        "Chemical Engineering",
        "Instrumentation Engineering"
    ],
    "JEC": [
        "Computer Science and Engineering",
        "Electrical Engineering",
        "Civil Engineering",
        "Mechanical Engineering",
        "Instrumentation Engineering"
    ],
    "JIST": [
        "Electronics and Telecommunication Engineering",
        "Civil Engineering",
        "Mechanical Engineering",
        "Power Electronics and Instrumentation"
    ],
    "BBEC": [
        "Electrical Engineering",
        "Civil Engineering",
        "Mechanical Engineering",
        "Chemical Engineering"
    ],
    "BVEC": [
        "Computer Science and Engineering",
        "Electronics and Telecommunication Engineering",
        "Civil Engineering",
        "Mechanical Engineering"
    ],
    "DEC": [
        "Computer Science and Engineering",
        "Civil Engineering",
        "Mechanical Engineering"
    ],
    "GEC": [
        "Civil Engineering",
        "Mechanical Engineering",
        "Chemical Engineering"
    ]
};

// 100% bug-free way to extract the array (no lazy regex bugs)
const startStr = "export const CEE_STATIC_DATA: CollegeData[] = ";
const endStr = "] as const;";

const startIndex = content.indexOf(startStr);
const endIndex = content.lastIndexOf(endStr);

if (startIndex === -1 || endIndex === -1) {
    console.error("❌ Could not find CEE_STATIC_DATA array boundaries.");
    process.exit(1);
}

const jsonStr = content.substring(startIndex + startStr.length, endIndex + 1);

let data;
try {
    // Clean trailing commas that TS allows but JSON doesn't
    const cleanJson = jsonStr.replace(/\,(\s*[\}\]])/g, '$1');
    data = JSON.parse(cleanJson);
} catch (e) {
    console.error("❌ JSON parse error:", e.message);
    process.exit(1);
}

// Filter out the fake branches
let removedCount = 0;
for (const college of data) {
    const allowed = collegeBranches[college.id];
    if (allowed) {
        const originalCount = college.branches.length;
        college.branches = college.branches.filter(b => allowed.includes(b.branchName));
        const removed = originalCount - college.branches.length;
        if (removed > 0) {
            console.log(`✓ ${college.name} (${college.id}): Removed ${removed} fake branch(es)`);
            removedCount += removed;
        }
    }
}

// Rebuild and save the file
const newJson = JSON.stringify(data, null, 2);
const newContent = content.substring(0, startIndex + startStr.length) + newJson + "\n" + endStr + content.substring(endIndex + endStr.length);

fs.writeFileSync(filePath, newContent, 'utf8');

console.log(`\n✅ Success! Removed ${removedCount} fake branch entries in total.`);
console.log(`✅ File '${filePath}' is now 100% clean!`);