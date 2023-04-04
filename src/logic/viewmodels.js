/**
 * @param {Array<StudyResponse>} studies
 * @returns
 */
export function createStudyViewmodel (studies) {
  const studyCardViewmodels = []

  let idsAssigned = []

  for (const rawStudy of studies) {
    const study = Object.assign({}, rawStudy)

    if (study.linked_studies) {
      const linkedStudyIds = study.linked_studies.map(linkedStudy => linkedStudy.id)

      if (idsAssigned.includes(study.id)) continue

      if (linkedStudyIds) {
        idsAssigned = idsAssigned.concat(linkedStudyIds)
      }
    } else {
      study.linked_studies = []
    }
    studyCardViewmodels.push(study)
  }

  return studyCardViewmodels.slice(0, 15)
}
