/**
 * @param {Array<StudyResponse>} studies
 * @returns
 */
export function createStudyViewmodel (studies) {
  const studyCardViewmodels = []

  /** track the ids of studies we linked */
  let studiesThatHaveBeenLinked = []

  for (const study of studies) {
    if (studiesThatHaveBeenLinked.includes(study.id)) continue

    const linkedStudies = study.linked_studies

    if (linkedStudies) {
      if (Array.isArray(linkedStudies)) {
        studiesThatHaveBeenLinked = studiesThatHaveBeenLinked.concat(linkedStudies.map(ls => ls.data.id))
      } else {
        studiesThatHaveBeenLinked.push(linkedStudies.data.id)
      }
    } else {
      study.linked_studies = []
    }

    studyCardViewmodels.push(study)
  }

  return studyCardViewmodels
}
