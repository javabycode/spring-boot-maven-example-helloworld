package com.javabycode.springboot;


import org.junit.Assert;
import org.junit.Ignore;
import org.junit.Test;
import org.springframework.ui.Model;

import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.verify;

public class HelloWorldControllerTest {

    @Test
    public void someDummyTest() {
        HelloWorldController helloWorldController = new HelloWorldController();

        Model modelMock = mock(Model.class);
        String name = "someNameHere";
        helloWorldController.hello(modelMock, name);

        verify(modelMock).addAttribute("name", name);
    }

    @Test
    @Ignore
    public void failingTest() {
        Assert.fail();
    }

    @Test
    @Ignore
    public void ignoredTest() {
        Assert.fail();
    }

}
