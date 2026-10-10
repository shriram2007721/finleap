
import Dexie from 'dexie';

export const db = new Dexie('ArthaQuestDB');
db.version(1).stores({
  programs: 'id, ngoId, status',
  schools: 'id, status, programId',
  classes: 'id, schoolId, joinCode',
  learners: 'id, classId',
  attempts: 'id, learnerId, skillId',
  rewards: 'id, learnerId',
});

// Deterministic Seeding will be implemented here
export async function seedMockData() {
  const count = await db.programs.count();
  if (count > 0) return; // Already seeded

  await db.programs.add({
    id: 'prog-1', ngoId: 'ngo-1', name: 'Financial Literacy for Grades 11-12, Hyderabad',
    version: '1.0', grades: [11, 12], region: 'Hyderabad', weeks: 8,
    languages: ['en', 'te', 'ur'], objectives: [], pillars: ['budget', 'save', 'invest', 'safe'],
    status: 'published', targetLearners: 1500, createdAt: new Date().toISOString()
  });

  // Additional seeds (schools, classes, learners) go here
}
