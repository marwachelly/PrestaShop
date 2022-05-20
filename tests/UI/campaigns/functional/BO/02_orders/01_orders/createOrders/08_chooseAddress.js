require('module-alias/register');

const {expect} = require('chai');

// Import utils
const helper = require('@utils/helpers');
const testContext = require('@utils/testContext');

// Import BO pages
const dashboardPage = require('@pages/BO/dashboard');
const ordersPage = require('@pages/BO/orders');
const addOrderPage = require('@pages/BO/orders/add');
const addAddressPage = require('@pages/BO/customers/addresses/add');

// Import demo data
const {DefaultCustomer} = require('@data/demo/customer');
const Address = require('@data/demo/address');

//Import faker data
const AddressFaker = require('@data/faker/address');

// Import common tests
const loginCommon = require('@commonTests/BO/loginBO');

const baseContext = 'functional_BO_orders_orders_createOrders_chooseAddress';
const createAddressData = new AddressFaker({country: 'France'});

let browserContext;
let page;
let editAddressIframe;

describe('BO - Orders - Create order : Choose address', async () => {
  before(async function () {
    browserContext = await helper.createBrowserContext(this.browser);
    page = await helper.newTab(browserContext);
  });

  after(async () => {
    await helper.closeBrowserContext(browserContext);
  });

  describe('Go to create order page', async () => {
    it('should login in BO', async function () {
      await loginCommon.loginBO(this, page);
    });

    it('should go to \'Orders > Orders\' page', async function () {
      await testContext.addContextItem(this, 'testIdentifier', 'goToOrdersPage', baseContext);

      await dashboardPage.goToSubMenu(
        page,
        dashboardPage.ordersParentLink,
        dashboardPage.ordersLink,
      );

      await ordersPage.closeSfToolBar(page);

      const pageTitle = await ordersPage.getPageTitle(page);
      await expect(pageTitle).to.contains(ordersPage.pageTitle);
    });

    it('should go to create order page', async function () {
      await testContext.addContextItem(this, 'testIdentifier', 'goToCreateOrderPage', baseContext);

      await ordersPage.goToCreateOrderPage(page);
      const pageTitle = await addOrderPage.getPageTitle(page);
      await expect(pageTitle).to.contains(addOrderPage.pageTitle);
    });

    it(`should choose customer ${DefaultCustomer.firstName} ${DefaultCustomer.lastName}`, async function () {
      await testContext.addContextItem(this, 'testIdentifier', 'chooseDefaultCustomer', baseContext);

      await addOrderPage.searchCustomer(page, DefaultCustomer.email);

      const isCartsTableVisible = await addOrderPage.chooseCustomer(page);
      await expect(isCartsTableVisible, 'History block is not visible!').to.be.true;
    });
  });

  describe('Edit address', async () => {
    it('should choose my address', async function () {
      await testContext.addContextItem(this, 'testIdentifier', 'chooseAddress', baseContext);

      const deliveryAddress = await addOrderPage.chooseDeliveryAddress(page, 'My address');
      await expect(deliveryAddress).to.equal(`${Address.third.firstName} ${Address.third.lastName}`
        + `${Address.third.company}${Address.third.address} ${Address.third.secondAddress}${Address.third.city},`
        + ` ${Address.third.state} ${Address.third.zipCode}${Address.third.country}${Address.third.phone}`);
    });

    it('should edit the delivery address', async function () {
      await testContext.addContextItem(this, 'testIdentifier', 'editAddress', baseContext);

      const isIframeVisible = await addOrderPage.clickOnEditAddress(page);
      await expect(isIframeVisible).to.be.true;

      editAddressIframe = await addOrderPage.getEditAdressIframe(page, 7);
      await addAddressPage.createEditAddress(editAddressIframe, createAddressData);
    });
  });
});
