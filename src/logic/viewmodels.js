/**
 * This function filters duplicate studies so they are consolidated in the frontend.
 * and only one is shown
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

      /** do not add the study we already added and folded into one */
      if (idsAssigned.includes(study.id)) continue

      if (linkedStudyIds) {
        idsAssigned = idsAssigned.concat(linkedStudyIds)
      }
    } else {
      study.linked_studies = []
    }
    studyCardViewmodels.push(study)
  }

  /** we have some spare to fill up the gaps that we create when folding studies together, make it the page amount again */
  return studyCardViewmodels.slice(0, 15)
}
