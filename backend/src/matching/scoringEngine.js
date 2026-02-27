const { isSkillMatch, getProficiencyWeight } = require('./skillMatcher');

/**
 * Calculates a weighted score for a student against an internship
 * Required skills (40%), Preferred (15%), Projects (15%), Proficiency (15%), Resume (10%), Certifications (5%)
 */
exports.calculateMatchScore = (student, internship) => {
    let breakdown = {
        requiredSkills: 0,
        preferredSkills: 0,
        projects: 0,
        proficiency: 0,
        resume: 0,
        certifications: 0,
        total: 0
    };

    // 1. Required Skills (40%)
    if (internship.requiredSkills && internship.requiredSkills.length > 0) {
        const matchedRequired = internship.requiredSkills.filter(reqSkill =>
            student.skills.some(sSkill => isSkillMatch(sSkill.name, reqSkill))
        );
        breakdown.requiredSkills = Math.round((matchedRequired.length / internship.requiredSkills.length) * 40);
    } else {
        breakdown.requiredSkills = 40; // Default if none required
    }

    // 2. Preferred Skills (15%)
    if (internship.preferredSkills && internship.preferredSkills.length > 0) {
        const matchedPreferred = internship.preferredSkills.filter(prefSkill =>
            student.skills.some(sSkill => isSkillMatch(sSkill.name, prefSkill))
        );
        breakdown.preferredSkills = Math.round((matchedPreferred.length / internship.preferredSkills.length) * 15);
    } else {
        breakdown.preferredSkills = 15;
    }

    // 3. Projects Relevance (15%)
    // Simple keyword matching in project descriptions
    if (student.projects && student.projects.length > 0) {
        const allSkills = [...(internship.requiredSkills || []), ...(internship.preferredSkills || [])];
        let projectMatchCount = 0;

        student.projects.forEach(project => {
            const combinedText = `${project.title} ${project.description}`.toLowerCase();
            if (allSkills.some(skill => combinedText.includes(skill.toLowerCase()))) {
                projectMatchCount++;
            }
        });

        breakdown.projects = Math.min(15, projectMatchCount * 5); // Max 15 points
    }

    // 4. Skill Proficiency (15%)
    if (student.skills && student.skills.length > 0) {
        const totalWeight = student.skills.reduce((acc, skill) => acc + getProficiencyWeight(skill.level), 0);
        const avgWeight = totalWeight / student.skills.length;
        // Normalize: 20 (Adv) is 100%, 10 (Int) is 50%, 5 (Beg) is 25%
        breakdown.proficiency = Math.round((avgWeight / 20) * 15);
    }

    // 5. Resume/Resume Text Similarity (10%)
    // Simple word overlay for this implementation
    if (student.resumeText && internship.description) {
        const jdKeywords = internship.description.toLowerCase().split(/\W+/);
        const resumeText = student.resumeText.toLowerCase();
        const matches = jdKeywords.filter(word => word.length > 3 && resumeText.includes(word));
        const uniqueMatches = [...new Set(matches)];
        breakdown.resume = Math.min(10, uniqueMatches.length);
    }

    // 6. Certifications (5%)
    if (student.certifications && student.certifications.length > 0) {
        breakdown.certifications = 5;
    }

    breakdown.total = breakdown.requiredSkills + breakdown.preferredSkills + breakdown.projects + breakdown.proficiency + breakdown.resume + breakdown.certifications;

    return breakdown;
};
