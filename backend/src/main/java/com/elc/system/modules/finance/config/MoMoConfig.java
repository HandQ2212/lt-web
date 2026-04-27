package com.elc.system.modules.finance.config;

import lombok.Data;
import org.springframework.boot.context.properties.ConfigurationProperties;
import org.springframework.context.annotation.Configuration;

@Data
@Configuration
@ConfigurationProperties(prefix = "payment.momo")
public class MoMoConfig {
    private String partnerCode;
    private String accessKey;
    private String secretKey;
    private String payUrl;
    private String returnUrl;
    private String ipnUrl;
    private String requestType = "payWithMethod";
}
