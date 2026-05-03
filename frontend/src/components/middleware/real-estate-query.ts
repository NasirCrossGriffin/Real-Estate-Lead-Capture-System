// estimateQuery.middleware.ts
// Same style as your previous middleware examples

const BASE_URL = import.meta.env.DEV ? import.meta.env.VITE_API_DEV_BASE_URL : import.meta.env.VITE_API_PROD_BASE_URL;

  async function getBaseUrl() {
    return BASE_URL;
  }

export type RealEstateQuery = {
  organization : String,
  user : String,
  address : String,
  city : String,
  state : String,
  zipCode : String,
  facingForeclosure : Boolean,
  currentLoanBalance : String | null,
  amountBehind : String | null,
  loanType : String | null,
  lenderName : String | null,
  auctionDate : String | null,
  description : String | null,
  consultationDate : String,
  service : String | null,
};

export type RealEstateQueryUpdate = Partial<RealEstateQuery>;

export async function CreateRealEstateQuery(protoRealEstateQuery: RealEstateQuery) {
  try {
      const url = await getBaseUrl();

    const response = await fetch(`${url}/api/real-estate-query`, {
      headers: { "content-type": "application/json" },
      method: "POST",
      body: JSON.stringify(protoRealEstateQuery),
    });

    if (response.ok) {
      const newEstimateQuery = await response.json();
      return newEstimateQuery;
    } else {
      return null;
    }
  } catch (err) {
    console.log(err);
    return null;
  }
}

export async function getEstimateQueries(
  filters?: { bodyShop?: string; user?: string; status?: string }
) {
  try {
      const url = await getBaseUrl();

    const params = new URLSearchParams();
    if (filters?.bodyShop) params.append("bodyShop", filters.bodyShop);
    if (filters?.user) params.append("user", filters.user);
    if (filters?.status) params.append("status", filters.status);

    const thisUrl = `${url}/api/real-estate-query${
      params.toString() ? `?${params.toString()}` : ""
    }`;

    const response = await fetch(thisUrl, {
      headers: { "content-type": "application/json" },
      method: "GET",
    });

    if (response.ok) {
      const estimateQueries = await response.json();
      return estimateQueries;
    } else {
      return null;
    }
  } catch (err) {
    console.log(err);
    return null;
  }
}

export async function getRealEstateQueriesByOrganization(organizationId : string) {
    const url = await getBaseUrl();

  try {
    const response = await fetch(`${url}/api/real-estate-query/organization/${organizationId}`, {
      headers: { "content-type": "application/json" },
      method: "GET",
    });

    if (response.ok) {
      const estimateQueries = await response.json();
      return estimateQueries;
    } else {
      return null;
    }
  } catch (err) {
    console.log(err);
    return null;
  }
}

export async function getEstimateQueryById(estimateQueryId: string) {
    const url = await getBaseUrl();

  try {
    const response = await fetch(
      `${url}/api/real-estate-query/${encodeURIComponent(estimateQueryId)}`,
      {
        headers: { "content-type": "application/json" },
        method: "GET",
      }
    );

    if (response.ok) {
      const estimateQuery = await response.json();
      return estimateQuery;
    } else {
      return null;
    }
  } catch (err) {
    console.log(err);
    return null;
  }
}

export async function updateRealEstateQuery(
  realEstateQueryId: string,
  updates: any
) {
    const url = await getBaseUrl();

  try {
    const response = await fetch(
      `${url}/api/real-estate-query/${encodeURIComponent(realEstateQueryId)}`,
      {
        headers: { "content-type": "application/json" },
        method: "PUT",
        body: JSON.stringify(updates),
      }
    );

    if (response.ok) {
      const updatedRealEstateQuery = await response.json();
      return updatedRealEstateQuery;
    } else {
      return null;
    }
  } catch (err) {
    console.log(err);
    return null;
  }
}

export async function deleteRealEstateQuery(realEstateQueryId: string) {
    const url = await getBaseUrl();

  try {
    const response = await fetch(
      `${url}/api/real-estate-query/${encodeURIComponent(realEstateQueryId)}`,
      {
        headers: { "content-type": "application/json" },
        method: "DELETE",
      }
    );

    if (response.ok) {
      const result = await response.json();
      return result; // { deleted: true, id: ... }
    } else {
      return null;
    }
  } catch (err) {
    console.log(err);
    return null;
  }
}

export type RealEstateQueryFilters = {
  inForeclosureOnly?: boolean;
  withPhotosOnly?: boolean;
  sortByFollowUpDate?: boolean;
  sortByStatus?: boolean;
  showUnviewedOnly?: boolean;
};

export async function getFilteredRealEstateQueriesByOrganization(
  organizationId: string,
  filters?: RealEstateQueryFilters
) {
  try {
    const url = await getBaseUrl();

    const params = new URLSearchParams();

    if (filters?.inForeclosureOnly !== undefined) {
      params.append("inForeclosureOnly", String(filters.inForeclosureOnly));
    }

    if (filters?.withPhotosOnly !== undefined) {
      params.append("withPhotosOnly", String(filters.withPhotosOnly));
    }

    if (filters?.sortByFollowUpDate !== undefined) {
      params.append("sortByFollowUpDate", String(filters.sortByFollowUpDate));
    }

    if (filters?.sortByStatus !== undefined) {
      params.append("sortByStatus", String(filters.sortByStatus));
    }

    if (filters?.showUnviewedOnly !== undefined) {
      params.append("showUnviewedOnly", String(filters.showUnviewedOnly));
    }

    const thisUrl = `${url}/api/real-estate-query/organization/${encodeURIComponent(
      organizationId
    )}/filtered${params.toString() ? `?${params.toString()}` : ""}`;

    const response = await fetch(thisUrl, {
      headers: { "content-type": "application/json" },
      method: "GET",
    });

    if (response.ok) {
      const filteredQueries = await response.json();
      return filteredQueries;
    } else {
      return null;
    }
  } catch (err) {
    console.log(err);
    return null;
  }
}