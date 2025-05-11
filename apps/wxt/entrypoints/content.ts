const linkedinProfilePattern = new MatchPattern('*://*.linkedin.com/in/*');

export default defineContentScript({
  matches: ['*://*.linkedin.com/*'],
  main(ctx) {
    if (linkedinProfilePattern.includes(window.location.href)) {
      mainProfile();
    }
    ctx.addEventListener(window, 'wxt:locationchange', ({ newUrl }) => {
      if (linkedinProfilePattern.includes(newUrl)) mainProfile();
      else {
        browser.runtime.sendMessage({
          type: "EMPTY_USER_DATA",
        });
      } 
    });
  },
});

function mainProfile() {
  const extractUserData = () => {
    const username = window.location.pathname.split('/in/')[1].split('/')[0];
    const profileUrl = window.location.href;
    
    const nameElement = document.querySelector('h1.inline.t-24.v-align-middle.break-words');
    const name = nameElement ? nameElement.textContent?.trim() : '';

    const locationElement = document.querySelector('span.text-body-small.inline.t-black--light.break-words');
    const location = locationElement ? locationElement.textContent?.trim() : '';

    const profileImageElement = document.querySelector('button.profile-photo-edit__edit-btn')?.querySelector(`img.evi-image`);
    const profileImage = profileImageElement ? profileImageElement.getAttribute('src') : '';

    const headlineElement = document.querySelector('.text-body-medium.break-words');
    const headline = headlineElement ? headlineElement.textContent?.trim() : '';

    const aboutSection = document.querySelector('div#about')?.closest('section');
    const aboutElement = aboutSection?.querySelector('.inline-show-more-text--is-collapsed span[aria-hidden="true"]');
    const about = aboutElement ? aboutElement.textContent?.trim() : '';

    const experienceSection = document.querySelector('div#experience')?.closest('section');
    const experienceElements = experienceSection?.querySelectorAll('.artdeco-list__item') ?? [];
    const experiences = Array.from(experienceElements).map((element, index) => {
      const order = index;
      const experienceEntity = element.querySelector('[data-view-name="profile-component-entity"]');
      
      const subComponents = element.querySelector('.pvs-entity__sub-components');
      const roleElements = subComponents?.querySelectorAll('[data-view-name="profile-component-entity"]');
      
      if (subComponents && roleElements && roleElements.length > 0) {
        const companyElement = experienceEntity?.querySelector('.t-14.t-normal span[aria-hidden="true"]');
        const companyLink = experienceEntity?.querySelector('a[data-field="experience_company_logo"]')?.getAttribute('href') ?? '';
        const companyId = companyLink.split('/company/')[1]?.split('/')[0] ?? crypto.randomUUID();;
        const companyName = experienceEntity?.querySelector('.hoverable-link-text.t-bold span[aria-hidden="true"]')?.textContent?.trim();
        const companyDuration = companyElement?.textContent?.trim();
        const companyLogo = experienceEntity?.querySelector('img.evi-image')?.getAttribute('src') ?? '';
        const roles = Array.from(roleElements).map(roleElement => {
          const jobTitle = roleElement.querySelector('.hoverable-link-text.t-bold span[aria-hidden="true"]')?.textContent?.trim();
          const employmentType = roleElement.querySelector('.t-14.t-normal span[aria-hidden="true"]')?.textContent?.trim();
          const duration = roleElement.querySelector('.pvs-entity__caption-wrapper span[aria-hidden="true"]')?.textContent?.trim();
          
          return {
            jobTitle,
            employmentType,
            duration
          };
        });
        
        return {
          order,
          companyName,
          companyLink,
          companyId,
          companyDuration,
          roles,
          companyLogo
        };
      } else {
        const titleElement = experienceEntity?.querySelector('.hoverable-link-text.t-bold span[aria-hidden="true"]');
        const jobTitle = titleElement?.textContent?.trim();
        
        const companyElement = experienceEntity?.querySelector('.t-14.t-normal span[aria-hidden="true"]');
        const companyName = companyElement?.textContent?.split('·')[0].trim();
        const companyLink = experienceEntity?.querySelector('a.optional-action-target-wrapper')?.getAttribute('href') ?? '';
        const companyId = companyLink.split('/company/')[1]?.split('/')[0] ?? crypto.randomUUID();;
        const companyLogo = experienceEntity?.querySelector('img.evi-image')?.getAttribute('src') ?? '';
        
        const durationElement = experienceEntity?.querySelector('span.pvs-entity__caption-wrapper[aria-hidden="true"]');
        const duration = durationElement?.textContent?.trim();
        
        const descriptionElement = experienceEntity?.querySelector('.inline-show-more-text--is-collapsed span[aria-hidden="true"]');
        const description = descriptionElement?.textContent?.trim();
        
        return {
          order,
          jobTitle,
          companyName,
          companyLink,
          companyId,
          duration,
          description,
          companyLogo
        };
      }
    });

    const educationSection = document.querySelector('div#education')?.closest('section');
    const educationElements = educationSection?.querySelectorAll('.artdeco-list__item') ?? [];
    const education = Array.from(educationElements).map((element, index) => {
      const order = index;
      const schoolName = element.querySelector('.hoverable-link-text.t-bold span[aria-hidden="true"]')?.textContent?.trim();
      const schoolLink = element.querySelector('a.optional-action-target-wrapper')?.getAttribute('href') ?? '';
      const schoolId = schoolLink.split('/company/')[1]?.split('/')[0] ?? crypto.randomUUID();
      const schoolLogo = element.querySelector('img.evi-image')?.getAttribute('src') ?? '';
      const degree = element.querySelector('.t-14.t-normal span[aria-hidden="true"]')?.textContent?.trim();
      const duration = element.querySelector('span.pvs-entity__caption-wrapper[aria-hidden="true"]')?.textContent?.trim();
      return { order, schoolName, schoolId, schoolLink, degree, duration, schoolLogo };
    });

    const userData = {
      username,
      profileImage,
      profileUrl,
      location,
      name,
      headline,
      about,
      experiences,
      education
    };

    console.log('LinkedIn User Data:', userData);
    
    browser.runtime.sendMessage({
      type: "SEND_USER_DATA",
      payload: userData,
    });
  };

  setTimeout(() => {
    extractUserData();
  }, 1000);
}
