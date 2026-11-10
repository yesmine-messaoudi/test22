// HANA only (added to the HANA build in package.json):
// these tables already exist in schema DBADMIN, so CAP must not create them.
// The app reaches them through the synonyms in db/src/dbadmin.hdbsynonym.
using {
  SAP_API_PACKAGES,
  SAP_API_METHODS,
  SAP_API_OPERATIONS,
  SHAREPOINT_DOCS
} from '../schema';

annotate SAP_API_PACKAGES with @cds.persistence.exists;
annotate SAP_API_METHODS with @cds.persistence.exists;
annotate SAP_API_OPERATIONS with @cds.persistence.exists;
annotate SHAREPOINT_DOCS with @cds.persistence.exists;
