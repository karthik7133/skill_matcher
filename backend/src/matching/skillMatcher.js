const synonyms = {
    'ML': ['Machine Learning', 'Artificial Intelligence', 'AI', 'Neural Networks'],
    'AI': ['Artificial Intelligence', 'Machine Learning', 'ML', 'Neural Networks'],
    'Node': ['Node.js', 'NodeJS', 'Javascript Backend'],
    'React': ['React.js', 'ReactJS', 'Frontend', 'Web Development'],
    'Python': ['Py', 'Django', 'Flask'],
    'Java': ['J2EE', 'Spring', 'Spring Boot'],
    'C++': ['CPP', 'C plus plus']
};

/**
 * Normalizes skill names and checks for matches (including synonyms)
 */
exports.isSkillMatch = (studentSkill, requiredSkill) => {
    const normalizedStudent = studentSkill.toLowerCase().trim();
    const normalizedRequired = requiredSkill.toLowerCase().trim();

    if (normalizedStudent === normalizedRequired) return true;

    // Check synonyms
    for (const [key, mapping] of Object.entries(synonyms)) {
        const normalizedKey = key.toLowerCase();
        const normalizedMapping = mapping.map(s => s.toLowerCase());

        if (
            (normalizedKey === normalizedRequired && normalizedMapping.includes(normalizedStudent)) ||
            (normalizedKey === normalizedStudent && normalizedMapping.includes(normalizedRequired)) ||
            (normalizedMapping.includes(normalizedStudent) && normalizedMapping.includes(normalizedRequired))
        ) {
            return true;
        }
    }

    return false;
};

exports.getProficiencyWeight = (level) => {
    switch (level) {
        case 'Advanced': return 20;
        case 'Intermediate': return 10;
        case 'Beginner': return 5;
        default: return 5;
    }
};
