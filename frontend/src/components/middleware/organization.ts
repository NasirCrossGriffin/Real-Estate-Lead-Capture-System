const BASE_URL = import.meta.env.DEV ? import.meta.env.VITE_API_DEV_BASE_URL : import.meta.env.VITE_API_PROD_BASE_URL;

  async function getBaseUrl() {
    return BASE_URL;
  }

export type Organization = {
  displayName: string;
  name: string;
  email: string;
  logo?: string;
};

export type OrganizationUpdate = Partial<Organization>;

export async function createOrganization(protoOrganization: Organization) {
    const url = await getBaseUrl();

  try {
    const response = await fetch(`${url}/api/organization`, {
      headers: { "content-type": "application/json" },
      method: "POST",
      body: JSON.stringify(protoOrganization),
    });

    if (response.ok) {
      const newOrganization = await response.json();
      return newOrganization;
    } else {
      return null;
    }
  } catch (err) {
    console.log(err);
    return null;
  }
}

export async function getOrganizations() {
    const url = await getBaseUrl();

  try {
    const response = await fetch(`${url}/api/organization`, {
      headers: { "content-type": "application/json" },
      method: "GET",
    });

    if (response.ok) {
      const organizations = await response.json();
      return organizations;
    } else {
      return null;
    }
  } catch (err) {
    console.log(err);
    return null;
  }
}

export async function getOrganizationById(organizationId: string) {
    const url = await getBaseUrl();

  try {
    const response = await fetch(
      `${url}/api/organization/${encodeURIComponent(organizationId)}`,
      {
        headers: { "content-type": "application/json" },
        method: "GET",
      }
    );

    if (response.ok) {
      const organization = await response.json();
      return organization;
    } else {
      return null;
    }
  } catch (err) {
    console.log(err);
    return null;
  }
}

export async function updateOrganization(
  organizationId: string,
  updates: any
) {
    const url = await getBaseUrl();

  try {
    const response = await fetch(
      `${url}/api/organization/${encodeURIComponent(organizationId)}`,
      {
        headers: { "content-type": "application/json" },
        method: "PUT",
        body: JSON.stringify(updates),
      }
    );

    if (response.ok) {
      const updatedOrganization = await response.json();
      return updatedOrganization;
    } else {
      return null;
    }
  } catch (err) {
    console.log(err);
    return null;
  }
}

export async function deleteOrganization(organizationId: string) {
  try {
      const url = await getBaseUrl();

    const response = await fetch(
      `${url}/api/organization/${encodeURIComponent(organizationId)}`,
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

export async function getOrganizationByName(name: string) {
  try {
      const url = await getBaseUrl();

    console.log(BASE_URL);

    const response = await fetch(
      `${url}/api/organization/name/${encodeURIComponent(name)}`,
      {
        headers: { "content-type": "application/json" },
        method: "GET",
      }
    );

    if (response.ok) {
      const organization = await response.json();
      return organization;
    } else {
      return null;
    }
  } catch (err) {
    console.log(err);
    return null;
  }
}