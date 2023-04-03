/**
 * @param {Array<StudyResponse>} studies
 * @returns
 */
export function createStudyViewmodel (studies) {
  const studyCardViewmodels = []

  let idsAssigned = []

  for (const rawStudy of studies) {
    const study = Object.assign({}, rawStudy)
    const linkedStudyIds = study.linked_studies

    if (idsAssigned.includes(study.id)) continue

    if (linkedStudyIds) {
      study.linked_studies = studies.filter(study => linkedStudyIds.includes(study.id))

      idsAssigned = idsAssigned.concat(linkedStudyIds)
    } else {
      study.linked_studies = []
    }
    studyCardViewmodels.push(study)
  }

  return studyCardViewmodels.slice(0, 15)
}
