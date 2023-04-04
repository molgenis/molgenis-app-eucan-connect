/**
 * @param {Array<StudyResponse>} studies
 * @returns
 */
export function createStudyViewmodel (studies) {
  const studyCardViewmodels = []

  for (const rawStudy of studies) {
    const study = Object.assign({}, rawStudy)
    if (!study.linked_studies) {
      study.linked_studies = []
    }

    studyCardViewmodels.push(study)
  }

  return studyCardViewmodels // studyCardViewmodels.slice(0, 15)
}
